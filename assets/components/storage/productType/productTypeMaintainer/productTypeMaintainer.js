(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-product-type></ssvq-storage-product-type>
     */
    app.directive('ssvqStorageProductType', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            templateUrl: 'components/storage/productType/productTypeMaintainer/productTypeMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, productTypeFactory, accountFactory) {
        var vm = this;
        vm.viewMode = 'list';
        vm.paginate = {
            page: 1,
            limit: 15
        };
        vm.productTypeList = null;

        /*
         * Create Product Type Dialog 
         */
        angular.extend($scope, {
            searchText: '',
            showSaveDialog: function($event) {
                $mdDialog.show({
                    targetEvent: $event,
                    clickOutsideToClose: true,
                    templateUrl: '/components/storage/productType/productTypeMaintainer/dialog.saveProductType.html',
                    controller: function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.productType);

                        accountFactory.getAll({}).then(
                            // success
                            response => {
                                if (response.ok) {
                                    vm.found = response.obj.found;
                                    vm.accounts = response.obj.accounts;
                                } else {
                                    vm.accounts = [];
                                }
                            },
                            // fail
                            err => {
                                debugger;
                            }
                        );
                    },
                    bindToController: true,
                    controllerAs: 'vm'
                }).then(productType => {
                    if (_.isEmpty(productType)) {
                        return;
                    }
                    $mdToast.showSimple('Creando tipo producto...');
                    productTypeFactory.save(productType).then(productTypeCreated => {
                        $mdToast.showSimple('Se ha creado el tipo producto');
                        $mdDialog.hide();
                        vm.onReload();
                        $scope.$apply();
                    }, error => $mdToast.showSimple(error.raw.message));
                });
            }
        });

        vm.nextPage = () => new Promise((resolve, reject) => {
            let page = vm.paginate.page;
            vm.paginate.page += 1
            productTypeFactory.getList({
                filter: $scope.searchText,
                paginate: vm.paginate
            }, true).then(data => {
                vm.productTypeList = (vm.productTypeList || []).concat(data.list);
                vm.total = data.total;
                $scope.$apply();
                resolve();
            }, () => {
                vm.paginate.page = page;
                if (vm.productTypeList === null) vm.productTypeList = [];
                $scope.$apply();
                reject();
            });
        });

        vm.onTablePaginate = () => {
            vm.paginate.page--;
            vm.productTypeList = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.onReload = () => {
            vm.paginate.page = 1;
            vm.onTablePaginate();
        }

        $scope.$watch('searchText', searchText => {
            vm.paginate.page = 0;
            vm.productTypeList = null;
            vm.total = 0;
            vm.nextPage().then(() => {}, () => {});
        }, true);
    }
})();