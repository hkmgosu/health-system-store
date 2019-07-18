(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-express-income-edit></ssvq-storage-express-income-edit>
     * ejemplo chile compra: http://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?ticket=98D238A3-B18C-4B3E-80F3-82E8E102DA59&codigo=3603-63-CM17
     */
    app.directive('ssvqStorageExpressIncomeEdit', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/expressIncome/expressIncomeEdit/expressIncomeEdit.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $stateParams, $mdDialog, $mdToast, expressIncomeFactory, unitProductsManagerFactory, companyFactory) {
        var vm = this;
        var vmParent = this;
        window._vm = this;

        vm.programs = [];
        vm.subprogramsView = [];
        vm.expressIncome = {};
        vm.cacheCompany = null;
        vm.cacheDestinyUnit = null;

        // requerido para imagen de producto
        vm.timestamp = product => moment((product || {}).updatedAt).format('X');


        // consumo a editar
        (function getExpressIncome() {
            return expressIncomeFactory.get($stateParams.id)
                .then(res => {
                    vm.expressIncome = res.obj.expressIncome;
                    vm.cacheCompany = Object.assign({}, vm.expressIncome.company);
                    vm.cacheDestinyUnit = Object.assign({}, vm.expressIncome.destinyUnit);

                    vm.expressIncome.status = vm.expressIncome.status || 1;
                    vm.expressIncome.company = vm.expressIncome.company && vm.expressIncome.company.id || null;
                    // vm.expressIncome.destinyUnit = vm.expressIncome.destinyUnit.id || null;
                    vm.newStatus = vm.expressIncome.status || 1;
                    if (!vm.expressIncome.details) vm.expressIncome.details = [];
                })
                .then(() => $scope.$apply())
                .catch(err => $mdToast.showSimple('Error al obtener consumo.' + (console.error(err) || '')));
        })();


        // bodegas y ubicaciones
        (function getUnits() {
            return unitProductsManagerFactory.getAllowedUnits()
                .then(obj => vm.units = obj.units)
                .catch(err => $mdToast.showSimple('Error al buscar las bodegas.' + (console.error(err) || '')));
        })();


        // proveedores
        (function getCompanies() {
            companyFactory.getAll()
                .then(res => vm.companies = res.obj.companies)
                .catch(err => $mdToast.showSimple('Error al obtener las compañías' + (console.log(err) || '')));
        })();


        vm.dialogProgram = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                bindToController: false,
                controllerAs: 'vm',
                templateUrl: '/components/storage/expressIncome/expressIncomeEdit/dialogProgram.html',
                controller() {
                    let vm = this;
                    window._dg = this;
                    vm.program = 0;
                    vm.subprogram = null;
                    vm.programs = vmParent.programs;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.addProgram = () => {
                        vmParent.subprogramsView.push(vmParent.getSubprogram(vm.subprogram || vm.program));
                        $mdDialog.hide();
                    };
                }
            });
        };


        // --------------- metodos --------------------
        vm.addDetail = ($event, subprogram) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                bindToController: true,
                controllerAs: 'vm',
                templateUrl: '/components/storage/expressIncome/expressIncomeEdit/dialogDetail.html',
                controller($mdDialog, $mdToast) {
                    let vm = this;
                    vm.detail = {};
                    vm.detail.expressIncome = vmParent.expressIncome.id;

                    vm.onSelectProduct = product => vm.detail.product = product;
                    vm.removeProduct = () => vm.detail.product = null;

                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => {
                        expressIncomeFactory.addDetail(vm.detail)
                            .then(res => {
                                if (!vmParent.expressIncome.details) {
                                    vmParent.expressIncome.details = [];
                                }
                                vmParent.expressIncome.details.push(res.obj.expressIncomeDetail)
                                $mdDialog.hide();
                            })
                            .catch(err => $mdToast.showSimple('Error al crear el detalle de consumo' + (console.error(err) || '')));
                    }
                }
            });
        };


        vm.editDetail = ($event, item) => {
            let detail = Object.assign({}, item);
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                bindToController: true,
                controllerAs: 'vm',
                templateUrl: '/components/storage/expressIncome/expressIncomeEdit/dialogDetail.html',
                controller($mdDialog, $mdToast) {
                    let vm = this;
                    vm.status = vmParent.expressIncome.status;
                    vm.detail = detail;
                    vm.detail.expressIncome = vmParent.expressIncome.id;
                    vm.onSelectProduct = product => vm.detail.product = product;
                    vm.removeProduct = () => vm.detail.product = null;

                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => {
                        (vm.detail.product && vm.detail.product.id) ? vm.detail.product = vm.detail.product.id: null;
                        expressIncomeFactory.saveDetail(vm.detail)
                            .then(res => {
                                for (let i = 0; i < vmParent.expressIncome.details.length; ++i) {
                                    let detail = vmParent.expressIncome.details[i];
                                    if (detail.id == res.obj.expressIncomeDetail.id) {
                                        vmParent.expressIncome.details.splice(i, 1, res.obj.expressIncomeDetail);
                                        break;
                                    }
                                }
                                $mdDialog.hide();
                            })
                            .catch(err => $mdToast.showSimple('Error al editar el detalle de consumo' + (console.error(err) || '')));
                    }
                }
            });
        };


        vm.delDetail = ($event, detail) => {
            expressIncomeFactory.delDetail(detail.id)
                .then(res => {
                    $mdToast.showSimple('Se ha eliminado el detalle de consumo');
                    for (let i = 0; i < vmParent.expressIncome.details.length; ++i) {
                        let detail = vmParent.expressIncome.details[i];
                        if (detail.id == res.obj.expressIncomeDetail.id) {
                            vmParent.expressIncome.details.splice(i, 1);
                            break;
                        }
                    }
                })
                .catch(err => $mdToast.showSimple('Error al eliminar el detalle de consumo' + (console.error(err) || '')));
        };


        vm.onChangeStatus = () => {
            expressIncomeFactory.update({
                    id: vm.expressIncome.id,
                    status: vm.newStatus
                }).then(res => {
                    vm.expressIncome.status = vm.newStatus;
                    $mdToast.showSimple('Se ha cambiado el estado del consumo.');
                })
                .catch(err => {
                    $mdToast.showSimple('Error al cambiar estado del consumo.' + (console.error(err) || ''));
                    vm.newStatus = vm.expressIncome.status || 1;
                });
        };


        vm.saveGeneral = () => {
            let data = Object.assign({}, vm.expressIncome);
            delete data.status;
            delete data.details;
            delete data.createdBy;

            expressIncomeFactory.update(data)
                .then(res => {
                    vm.expressIncome = res.obj.expressIncome;
                    $mdToast.showSimple('Se ha guardado los datos generales.');
                })
                .catch(err => {
                    $mdToast.showSimple('Error al cambiar estado del registro.' + (console.error(err) || ''));
                    vm.newStatus = vm.expressIncome.status || 1;
                });
        };
    }
})();