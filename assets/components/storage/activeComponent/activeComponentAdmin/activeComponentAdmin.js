(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-active-component-admin></ssvq-storage-active-component-admin>
     */
    app.directive('ssvqStorageActiveComponentAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            templateUrl: '/components/storage/activeComponent/activeComponentAdmin/activeComponentAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, activeComponentFactory) {
        var vm = this;
        vm.viewMode = 'list';
        vm.page = 1;
        vm.limit = 15;
        vm.activeComponents = null;
        vm.promise = null;
        vm.searchText = '';

        // Create Type Dialog 
        vm.onCreate = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/activeComponent/activeComponentActions/dialogSave.html',
                controller: function($mdDialog) {
                    let vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.activeComponent);
                },
                bindToController: true,
                controllerAs: 'vm'
            }).then(
                // dialog confirm
                dataConfirm => {
                    if (_.isEmpty(dataConfirm)) {
                        return;
                    }
                    $mdToast.showSimple('Creando component activo...');
                    activeComponentFactory.create(dataConfirm).then(
                        // success
                        created => {
                            $mdToast.showSimple('Se ha creado el component activo');
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
            vm.promise = activeComponentFactory.getAll({
                filter: $scope.searchText,
                page: vm.page,
                limit: vm.limit
            }, true).then(data => {
                vm.activeComponents = (vm.activeComponents || []).concat(data.obj.activeComponents);
                vm.found = data.obj.found;
                $scope.$apply();
                resolve();
            }, () => {
                reject();
            });
        });

        vm.nextTable = () => {
            vm.page--;
            vm.activeComponents = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.afterCreate = () => {
            if (vm.viewMode == 'list') {
                vm.page = 1;
            }
            vm.activeComponents = null;
            vm.nextTable();
        };

        vm.afterDelete = param => {
            vm.page = 0;
            vm.activeComponents = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.viewChange = () => {
            vm.viewMode = vm.viewMode == 'list' ? 'table' : 'list';
            if (vm.viewMode == 'list') {
                vm.page = 0;
                vm.activeComponents = null;
                vm.nextPage().then(() => {}, () => {});
            } else {
                vm.page--;
                vm.activeComponents = null;
                vm.nextPage().then(() => {}, () => {});
            }
        };

        $scope.$watch('searchText', searchText => {
            vm.page = 0;
            vm.activeComponents = null;
            vm.found = 0;
            vm.nextPage().then(() => {}, () => {});
        }, true);
    }

})();