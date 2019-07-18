(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-express-income-admin></ssvq-storage-express-income-admin>
     */
    app.directive('ssvqStorageExpressIncomeAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/expressIncome/expressIncomeAdmin/expressIncomeAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $mdSidenav, $mdDialog,
        expressIncomeFactory) {
        //
        var vm = this;
        var vmParent = this;
        window._vm = this;
        vm.viewMode = 'list';
        vm.limit = 15;
        vm.page = 0;
        vm.searchText = '';

        vm.toggleFilter = () => {
            $mdSidenav('expressIncomeses-filter').toggle();
        };

        // ------ buscar los consumos inmediatos ----------
        vm.nextPage = () => new Promise((resolve, reject) => {
            if (vm.found && Math.ceil(vm.found / vm.limit) <= vm.page) {
                return resolve();
            }
            vm.page += 1;

            let criteria = {
                limit: vm.limit,
                page: vm.page,
                filter: vm.searchText
            };

            criteria.where = {};
            if (vm.minDate || vm.maxDate) criteria.where.createdAt = {};
            if (vm.minDate) criteria.where.createdAt['>='] = vm.minDate.toISOString().substr(0, 10) + 'T00:00:00';
            if (vm.maxDate) criteria.where.createdAt['<='] = vm.maxDate.toISOString().substr(0, 10) + 'T23:59:59';

            vm.promise = expressIncomeFactory.getAll(criteria).then(res => {
                vm.expressIncomeses = (vm.expressIncomeses || []).concat(res.obj.expressIncomeses);
                vm.found = res.obj.found;
                $scope.$apply();
                resolve();
            }).catch(err => {
                console.error(err);
                reject(err);
            });
        });

        //----- cambiar el modo de vista -------------
        vm.viewChange = () => {
            vm.viewMode = vm.viewMode == 'list' ? 'table' : 'list';
            if (vm.viewMode == 'list') {
                vm.page = 0;
                vm.expressIncomeses = null;
                vm.nextPage().then(() => {}, () => {});
            } else {
                vm.page--;
                vm.expressIncomeses = null;
                vm.nextPage().then(() => {}, () => {});
            }
        };

        //--------- pagina siguiente en modo table -----------
        vm.nextTable = () => {
            vm.page--;
            vm.expressIncomeses = null;
            vm.nextPage().then(() => {}, () => {});
        };

        //---------- limpiar busqueda --------------
        vm.cleanSearch = () => {
            vm.searchText = '';
            vm.page = 0;
            vm.minDate = null;
            vm.maxDate = null;
            vm.expressIncomeses = null;
            vm.nextPage().then(() => {}).catch(() => {});
        };


        vm.refreshSearch = () => {
            vm.page = 0;
            vm.expressIncomeses = null;
            vm.nextPage().then(() => {}, () => {});
        };


        // Mostrar filtro de fecha creación
        vm.showCreatedAtFilter = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/storage/expressIncome/expressIncomeAdmin/rangeDate.html',
                controller: function($mdDialog) {
                    var vm = this;
                    vm.minDate = vmParent.minDate || null;
                    vm.maxDate = vmParent.maxDate || null;

                    vm.confirm = () => {
                        vmParent.minDate = vm.minDate;
                        vmParent.maxDate = vm.maxDate;
                        vmParent.refreshSearch();
                        $mdDialog.hide();
                    };
                    vm.cancel = () => {
                        $mdDialog.hide();
                    };
                },
                controllerAs: 'vm'
            });
        };


        vm.onCreate = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                bindToController: true,
                controllerAs: 'vm',
                templateUrl: '/components/storage/expressIncome/expressIncomeAdmin/dialogCreate.html',
                controller($mdDialog, $mdToast, unitProductsManagerFactory, companyFactory) {
                    let vm = this;
                    vm.expressIncome = {};
                    vm.expressIncome.date = moment().format('YYYY-MM-DD');

                    unitProductsManagerFactory.getAllowedUnits()
                        .then(obj => {
                            vm.units = obj.units;
                            vm.expressIncome.destinyUnit = null;
                            // if (vm.units.length) vm.expressIncome.destinyUnit = vm.units[0];
                        })
                        .catch(err => $mdToast.showSimple('Error al obtener las bodegas' + (console.log(err) || '')));

                    companyFactory.getAll()
                        .then(res => vm.companies = res.obj.companies)
                        .catch(err => $mdToast.showSimple('Error al obtener las compañías' + (console.log(err) || '')));

                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => {
                        expressIncomeFactory.create(vm.expressIncome)
                            .then(res => {
                                $mdDialog.hide();
                                document.location.href = '#/bodega/consumo-inmediato/' + res.obj.expressIncome.id;
                            })
                            .catch(err => $mdToast.showSimple('Error al registrar el consumo inmediato' + (console.error(err) || '')));
                    }
                }
            });
        };


        vm.timeSearch = null;
        $scope.$watch('vm.searchText', searchText => {
            if (vm.timeSearch) clearTimeout(vm.timeSearch);
            vm.timeSearch = setTimeout(() => vm.refreshSearch(), 500);
        });
    }
})();