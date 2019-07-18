(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-cost-center></ssvq-storage-cost-center>
     */
    app.directive('ssvqStorageCostCenter', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            templateUrl: '/components/storage/costCenter/costCenterMaintainer/costCenterMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, costCenterFactory) {
        var vm = this;
        vm.viewMode = 'list';
        vm.page = 1;
        vm.limit = 15;
        vm.costCenters = null;
        vm.promise = null;
        vm.searchText = '';

        // Create Product Type Dialog 
        vm.onCreate = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/costCenter/costCenterActions/dialogSave.html',
                controller: function($mdDialog) {
                    let vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.costCenter);
                },
                bindToController: true,
                controllerAs: 'vm'
            }).then(
                // dialog confirm
                dataConfirm => {
                    if (_.isEmpty(dataConfirm)) {
                        return;
                    }
                    $mdToast.showSimple('Creando Centro de Costos...');
                    costCenterFactory.create(dataConfirm).then(
                        // success
                        created => {
                            $mdToast.showSimple('Se ha creado la Centro de Costos');
                            $mdDialog.hide();
                            created.ok && vm.afterCreate();
                        },
                        // fail
                        error => $mdToast.showSimple(error.raw.message)
                    );
                }
            );
        };

        vm.nextPage = () => new Promise((resolve, reject) => {
            if (vm.found && Math.ceil(vm.found / vm.limit) <= vm.page) {
                return resolve();
            }
            vm.page += 1;
            vm.promise = costCenterFactory.getAll({
                filter: $scope.searchText,
                page: vm.page,
                limit: vm.limit
            }, true).then(data => {
                vm.costCenters = (vm.costCenters || []).concat(data.obj.costCenters);
                vm.found = data.obj.found;
                $scope.$apply();
                resolve();
            }, () => {
                reject();
            });
        });

        vm.nextTable = () => {
            vm.page--;
            vm.costCenters = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.afterCreate = () => {
            if (vm.viewMode == 'list') {
                vm.page = 1;
            }
            vm.costCenters = null;
            vm.nextTable();
        };

        vm.afterDelete = param => {
            console.log('afterDelete', param);
            vm.page = 0;
            vm.costCenters = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.viewChange = () => {
            vm.viewMode = vm.viewMode == 'list' ? 'table' : 'list';
            if (vm.viewMode == 'list') {
                vm.page = 0;
                vm.costCenters = null;
                vm.nextPage().then(() => {}, () => {});
            } else {
                vm.page--;
                vm.costCenters = null;
                vm.nextPage().then(() => {}, () => {});
            }
        };

        $scope.$watch('searchText', searchText => {
            vm.page = 0;
            vm.costCenters = null;
            vm.found = 0;
            vm.nextPage().then(() => {}, () => {});
        }, true);
    }

})();