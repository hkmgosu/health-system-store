(function () {
    'use strict';
    /**
     * Example
     * <ssvq-resource-maintainer></ssvq-resource-maintainer>
     */
    app.directive('ssvqResourceMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/resourceMaintainer/resourceMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $resourceFactory, $mdDialog, $mdToast, employeeFactory, unitFactory, $mdSidenav) {
        var vm = this;
        vm.resourceList = null;
        vm.count = 0;
        vm.pagination = { page: 0, limit: 20 };
        let filter;
        vm.toggleFilter = () => { $mdSidenav('resource-filter').toggle(); };

        vm.showDetailsDialog = ($event, resource) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/resourceMaintainer/dialog.detailsResource.html',
                /* @ngInject */
                controller: function ($mdDialog, $resourceFactory) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.resource);

                    vm.resource = angular.copy(vm.tmpResource);

                    if (vm.resource.id) {
                        $resourceFactory.getEmployeeListByResource(vm.resource.id).then(
                            employeeResourceList => vm.employeeResourceList = employeeResourceList,
                            err => console.log('err')
                        );
                    }

                    vm.confirmData = () => {
                        $mdToast.showSimple('Actualizando recurso...');
                        $resourceFactory.update(_.omit(vm.resource, [
                            'currentEmployee',
                            'establishment',
                            'unit'
                        ])).then(
                            () => {
                                Object.assign(vm.tmpResource, vm.resource);
                                $mdToast.showSimple('El recurso se ha actualizado exitosamente');
                            },
                            () => $mdToast.showSimple('Lo sentimos, ha ocurrido un error actualizando el recurso')
                        );
                    };

                    vm.confirmLocation = () => {
                        $mdToast.showSimple('Actualizando recurso...');
                        $resourceFactory.updateLocationInfo({
                            id: vm.resource.id,
                            currentEmployee: vm.resource.currentEmployee ? vm.resource.currentEmployee.id : null,
                            establishment: vm.resource.establishment ? vm.resource.establishment.id : null,
                            unit: vm.resource.unit ? vm.resource.unit.id : null
                        }).then(() => {
                            Object.assign(vm.tmpResource, vm.resource);
                            $mdToast.showSimple('El recurso se ha actualizado exitosamente');
                        }, () => $mdToast.showSimple('Lo sentimos, ha ocurrido un error actualizando el recurso'));
                    };

                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    tmpResource: resource,
                    resourceTypeList: vm.resourceTypeList
                }
            });
        };

        vm.showCreateDialog = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/resourceMaintainer/dialog.createResource.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.resource);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then(resource => {
                if (!resource) { return; }
                $mdToast.showSimple('Creando recurso...');
                $resourceFactory.create(resource).then(
                    () => $mdToast.showSimple('El recurso se ha creado exitosamente'),
                    () => $mdToast.showSimple('Lo sentimos, ha ocurrido un error creando el recurso')
                );
            });
        };

        /**
         * Exportar datos filtrados como excel
         */
        vm.exportData = () => {
            $resourceFactory.getExportList().then(list => {
                var wb = {
                    SheetNames: ['Recursos'],
                    Sheets: {
                        'Recursos': XLSX.utils.json_to_sheet(list)
                    }
                };
                XLSX.writeFile(wb, 'recursos-ssvq.xlsx');
            });
        };

        /**
         * Carga de una nueva página en lista infinita
         */
        vm.nextPage = () => new Promise((resolve, reject) => {
            vm.pagination.page++;
            // Llamada a factory para obtener lista
            $resourceFactory.getList(filter, vm.pagination).then(res => {
                vm.resourceList = (vm.resourceList || []).concat(res.list);
                vm.count = res.count;
                _.isEmpty(res.list) ? reject() : resolve();
            }, () => {
                reject();
            });
        });

        vm.applyFilter = externalFilter => {
            filter = externalFilter;
            vm.resourceList = null;
            vm.count = 0;
            vm.pagination.page = 0;
            vm.nextPage().then(() => { }, () => { });
        };

        vm.getResourceIcon = (type) => {
            type = parseInt(type);
            switch (type) {
                case 1:
                    return 'fa fa-mobile';
                case 2:
                    return 'fa fa-tablet';
                case 3:
                    return 'fa fa-desktop';
                case 4:
                    return 'fa fa-desktop';
                case 5:
                    return 'fa fa-television';
                case 6:
                    return 'fa fa-wifi';
                case 7:
                    return 'fa fa-laptop';
                default:
                    return 'fa fa-question-circle-o';
            }
        };
    }
})();