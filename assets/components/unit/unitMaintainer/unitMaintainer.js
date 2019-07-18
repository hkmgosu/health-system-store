(function () {
    'use strict';
    /**
     * Example
     * <ssvq-unit-maintainer></ssvq-unit-maintainer>
     */
    app.directive('ssvqUnitMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/unit/unitMaintainer/unitMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, unitFactory, unitTypeFactory, $mdBottomSheet) {
        var vm = this;

        let units = [];

        vm.updateList = (mainUnit) => {
            /**
             * Obtención lista de unidades dependientes
             */
            vm.childrenList = _.filter(units, {
                parent: mainUnit ? mainUnit.id : null
            });
            vm.breadcrumbs = [];
            if (mainUnit) {
                mainUnit.parent = _.isObject(mainUnit.parent) ? mainUnit.parent.id : mainUnit.parent;
                mainUnit.hierarchy ? mainUnit.hierarchy.split('.').forEach(breadcrumb => {
                    vm.breadcrumbs.push(_.find(units, { id: parseInt(breadcrumb) }));
                }) : null;
            }
            vm.mainUnit = mainUnit;
        };

        angular.extend($scope, {
            exportOrgChart: function () {
                unitFactory.exportOrgChart($scope.orgChart)
                    .then(function (res) {
                        if (res.ok) {
                            $scope.orgChart.root.uuid = res.obj.uuid;
                            $scope.orgChart.root.iframe = '<iframe src="' + window.location.origin + '/embed/' + res.obj.uuid + '.html"></iframe>';
                            $mdToast.showSimple($translate.instant('UNIT.ORGCHART.UPDATE.SUCCESS'));
                        } else {
                            $mdToast.showSimple($translate.instant('UNIT.ORGCHART.UPDATE.ERROR'));
                        }
                    }, function (err) {
                        debugger;
                    });
            },
            showSupervisorsDialog: (unit) => {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    preserveScope: true,
                    templateUrl: '/components/unit/unitMaintainer/dialog.supervisors.tmpl.html',
                    /* @ngInject */
                    controller: function ($mdDialog, unit) {
                        var vm = this;
                        vm.unit = unit;
                        vm.cancel = () => {
                            $mdDialog.hide();
                        };
                        vm.msg = '';
                    },
                    controllerAs: 'vm',
                    locals: {
                        unit: unit
                    }
                });
            }
        });

        // Obtener lista de tipos de unidad
        unitTypeFactory.getAll().then(unitTypeList => vm.unitTypeList = unitTypeList);
        // Obtener lista completa de unidades
        unitFactory.getAll({
            filter: $scope.searchText,
            populate: false
        }).then(unitList => {
            units = unitList;
            vm.updateList();
        }, (err) => console.log(err));

        let showSaveDialog = (unitSelected, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/unit/unitMaintainer/dialog.save.tmpl.html',
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.save = () => $mdDialog.hide(vm.unit);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { unit: angular.copy(unitSelected) || {} }
            }).then((unit) => {
                unit.level = !_.isEmpty(vm.mainUnit) ? vm.mainUnit.level + 1 : 0;
                unit.establishment = (unit.establishment) ? unit.establishment.id : null;
                $mdToast.showSimple($translate.instant('UNIT.OTHERS.SAVING'));
                unitFactory.save(unit).then(unitSaved => {
                    if (unit.id) {
                        _.extend(_.find(units, { id: unit.id }), unit);
                        $mdToast.showSimple('Unidad actualizada con exitosamente');
                    } else {
                        $mdToast.showSimple('Unidad creada con exitosamente');
                        _.extend(unit, unitSaved);
                        units.push(unit);
                        vm.childrenList.push(unit);
                    }
                }, err => {
                    $mdToast.showSimple('Hubo un error actualizando la unidad');
                });
            });
        };

        vm.addUnit = () => showSaveDialog({
            parent: !_.isEmpty(vm.mainUnit) ? vm.mainUnit.id : null
        });

        vm.editUnit = (unit, $event) => showSaveDialog(unit, $event);

        vm.deleteUnit = (unit, $event) => {
            if (!_.find(units, { parent: unit.id })) {
                $mdDialog.show(
                    $mdDialog.confirm()
                        .title($translate.instant('UNIT.DELETE.TITLE'))
                        .textContent($translate.instant('UNIT.DELETE.TEXTCONTENT'))
                        .ok($translate.instant('UNIT.DELETE.OK'))
                        .ariaLabel($translate.instant('UNIT.DELETE.TITLE'))
                        .cancel($translate.instant('UNIT.DELETE.CANCEL'))
                        .targetEvent($event)
                ).then(() => {
                    $mdToast.showSimple($translate.instant('UNIT.OTHERS.DELETING'));
                    unitFactory.delete(unit.id)
                        .then((response) => {
                            $mdToast.showSimple($translate.instant(response.msg));
                            _.remove(units, { id: unit.id });
                            _.remove(vm.childrenList, { id: unit.id });
                        }, () => { });
                });
            } else {
                $mdDialog.show(
                    $mdDialog.alert({
                        title: 'Alerta',
                        textContent: 'No se puede eliminar la unidad seleccionada porque tiene subunidades asociadas',
                        ok: 'Entiendo',
                        targetEvent: $event
                    })
                );
            }
        };

        vm.manageUnitEmployees = (unit, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/unit/unitMaintainer/dialog.employees.tmpl.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { unit: unit }
            });
        };

        vm.showOrgChart = (root, $event) => {
            root.iframe = '<iframe src="' + window.location.origin + '/embed/' + root.uuid + '.html"></iframe>';
            var root = angular.copy(root);
            root.parent = null;
            var getFilteredByRoot = function (root) {
                var all = angular.copy(units);
                var tmpUnits = [root];
                var rec = function (root) {
                    var childrens = _.remove(all, { parent: root.id });
                    tmpUnits = _.concat(tmpUnits, childrens);
                    childrens.forEach(c => {
                        rec(c);
                    });
                };
                rec(root);
                return tmpUnits;
            };
            var loadChart = function () {
                google.charts.load('current', { packages: ["orgchart"] });
                google.charts.setOnLoadCallback(drawChart);

                function drawChart() {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Name');
                    data.addColumn('string', 'Manager');
                    data.addColumn('string', 'ToolTip');
                    // For each orgchart box, provide the name, manager, and tooltip to show.
                    data.addRows($scope.orgChart.rows);

                    // Create the chart.
                    var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));
                    // Draw the chart, setting the allowHtml option to true for the tooltips.
                    chart.draw(data, { allowHtml: true });
                }
            };

            var rows = [];
            (getFilteredByRoot(root)).forEach(o => {
                rows.push([
                    {
                        v: o.id.toString(),
                        f: '<div class="oc-unit">' + o.name + '</div>'
                    },
                    (o.parent || '').toString(),
                    o.name
                ]);
                (o.employees || []).forEach(employee => {
                    rows.push([
                        {
                            v: employee.id.toString(),
                            f: '<div class="oc-employee">' + (employee.name + ' ' + employee.lastname) + '</div>'
                        },
                        o.id.toString(),
                        (employee.name + ' ' + employee.lastname)
                    ]);
                });
            });

            $scope.orgChart = {
                root: root,
                rows: rows
            };
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                scope: $scope,
                preserveScope: true,
                templateUrl: '/components/unit/unitMaintainer/org-chart.tmpl.html',
                controller: function DialogController($scope, $mdDialog) {
                    $scope.cancel = function () {
                        $mdDialog.hide();
                    };
                    $scope.msg = '';
                },
                onComplete: loadChart
            });
        };

        vm.mapEstablishment = (unit, $event) => {
            var confirm = $mdDialog.confirm()
                .title('Mapeo de establecimiento')
                .textContent('¿Desea asignar el establecimiento a todas las unidades dependientes?')
                .ariaLabel('Mapear establecimiento')
                .targetEvent($event)
                .ok('Mapear establecimiento')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(() => {
                unitFactory.mapEstablishment(unit.id).then(
                    () => $mdToast.showSimple('Mapeo realizado exitosamente'),
                    () => $mdToast.showSimple('Error mapeando establecimiento')
                );
            });
        };

        vm.manageUnitBoss = (unit, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/unit/unitMaintainer/dialog.managers.tmpl.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { unit: unit }
            });
        };
    }
})();