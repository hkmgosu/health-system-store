(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-company-admin></ssvq-storage-company-admin>
     */
    app.directive('ssvqStorageCompanyAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            templateUrl: '/components/storage/company/companyAdmin/companyAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, companyFactory) {
        var vm = this;
        vm.viewMode = 'list';
        vm.page = 1;
        vm.limit = 15;
        vm.companies = null;
        vm.promise = null;
        vm.searchText = '';

        // Create Dialog 
        vm.onCreate = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/company/companyActions/dialogSave.html',
                controller: function($mdDialog) {
                    let vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.company);
                },
                bindToController: true,
                controllerAs: 'vm'
            }).then(
                // dialog confirm
                dataConfirm => {
                    if (_.isEmpty(dataConfirm)) {
                        return;
                    }
                    $mdToast.showSimple('Creando compañía...');
                    companyFactory.create(dataConfirm).then(
                        // success
                        created => {
                            $mdToast.showSimple('Se ha creado el compañía');
                            $mdDialog.hide();
                            created.ok && vm.afterCreate();
                        },
                        // fail
                        error => $mdToast.showSimple(error.raw ? error.raw.message : JSON.stringify(error))
                    );
                }
            );
        };

        vm.nextPage = () => new Promise((resolve, reject) => {
            if (vm.found && Math.ceil(vm.found / vm.limit) <= vm.page) {
                return resolve();
            }
            vm.page += 1;
            vm.promise = companyFactory.getAll({
                filter: $scope.searchText,
                page: vm.page,
                limit: vm.limit
            }, true).then(data => {
                vm.companies = (vm.companies || []).concat(data.obj.companies);
                vm.found = data.obj.found;
                $scope.$apply();
                resolve();
            }, () => {
                reject();
            });
        });

        vm.nextTable = () => {
            vm.page--;
            vm.companies = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.afterCreate = () => {
            if (vm.viewMode == 'list') {
                vm.page = 1;
            }
            vm.companies = null;
            vm.nextTable();
        };

        vm.afterDelete = param => {
            console.log('afterDelete', param);
            vm.page = 0;
            vm.companies = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.viewChange = () => {
            vm.viewMode = vm.viewMode == 'list' ? 'table' : 'list';
            if (vm.viewMode == 'list') {
                vm.page = 0;
                vm.companies = null;
                vm.nextPage().then(() => {}, () => {});
            } else {
                vm.page--;
                vm.companies = null;
                vm.nextPage().then(() => {}, () => {});
            }
        };

        $scope.$watch('searchText', searchText => {
            vm.page = 0;
            vm.companies = null;
            vm.found = 0;
            vm.nextPage().then(() => {}, () => {});
        }, true);
    }

})();