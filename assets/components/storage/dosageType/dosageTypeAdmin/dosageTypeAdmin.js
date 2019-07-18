(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-dosage-type-admin></ssvq-storage-dosage-type-admin>
     */
    app.directive('ssvqStorageDosageTypeAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            templateUrl: '/components/storage/dosageType/dosageTypeAdmin/dosageTypeAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, dosageTypeFactory) {
        var vm = this;
        vm.viewMode = 'list';
        vm.page = 1;
        vm.limit = 15;
        vm.dosageTypes = null;
        vm.promise = null;
        vm.searchText = '';

        // Create Type Dialog 
        vm.onCreate = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/dosageType/dosageTypeActions/dialogSave.html',
                controller: function($mdDialog) {
                    let vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.dosageType);
                },
                bindToController: true,
                controllerAs: 'vm'
            }).then(
                // dialog confirm
                dataConfirm => {
                    if (_.isEmpty(dataConfirm)) {
                        return;
                    }
                    $mdToast.showSimple('Creando tipo de dosificación...');
                    dosageTypeFactory.create(dataConfirm).then(
                        // success
                        created => {
                            $mdToast.showSimple('Se ha creado el tipo de dosificación');
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
            vm.promise = dosageTypeFactory.getAll({
                filter: $scope.searchText,
                page: vm.page,
                limit: vm.limit
            }, true).then(data => {
                vm.dosageTypes = (vm.dosageTypes || []).concat(data.obj.dosageTypes);
                vm.found = data.obj.found;
                $scope.$apply();
                resolve();
            }, () => {
                reject();
            });
        });

        vm.nextTable = () => {
            vm.page--;
            vm.dosageTypes = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.afterCreate = () => {
            if (vm.viewMode == 'list') {
                vm.page = 1;
            }
            vm.dosageTypes = null;
            vm.nextTable();
        };

        vm.afterDelete = param => {
            console.log('afterDelete', param);
            vm.page = 0;
            vm.dosageTypes = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.viewChange = () => {
            vm.viewMode = vm.viewMode == 'list' ? 'table' : 'list';
            if (vm.viewMode == 'list') {
                vm.page = 0;
                vm.dosageTypes = null;
                vm.nextPage().then(() => {}, () => {});
            } else {
                vm.page--;
                vm.dosageTypes = null;
                vm.nextPage().then(() => {}, () => {});
            }
        };

        $scope.$watch('searchText', searchText => {
            vm.page = 0;
            vm.dosageTypes = null;
            vm.found = 0;
            vm.nextPage().then(() => {}, () => {});
        }, true);
    }

})();