(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-presentation-type-admin></ssvq-storage-presentation-type-admin>
     */
    app.directive('ssvqStoragePresentationTypeAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            templateUrl: '/components/storage/presentationType/presentationTypeAdmin/presentationTypeAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, presentationTypeFactory) {
        var vm = this;
        vm.viewMode = 'list';
        vm.page = 1;
        vm.limit = 15;
        vm.presentationsType = null;
        vm.promise = null;
        vm.searchText = '';

        // Create Product Type Dialog 
        vm.onCreate = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/presentationType/presentationTypeActions/dialogSave.html',
                controller: function($mdDialog) {
                    let vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.presentationType);
                },
                bindToController: true,
                controllerAs: 'vm'
            }).then(
                // dialog confirm
                dataConfirm => {
                    if (_.isEmpty(dataConfirm)) {
                        return;
                    }
                    $mdToast.showSimple('Creando tipo de presentación...');
                    presentationTypeFactory.create(dataConfirm).then(
                        // success
                        created => {
                            $mdToast.showSimple('Se ha creado el tipo de presentación');
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
            vm.promise = presentationTypeFactory.getAll({
                filter: $scope.searchText,
                page: vm.page,
                limit: vm.limit
            }, true).then(data => {
                vm.presentationsType = (vm.presentationsType || []).concat(data.obj.presentationsType);
                vm.found = data.obj.found;
                $scope.$apply();
                resolve();
            }, () => {
                reject();
            });
        });

        vm.nextTable = () => {
            vm.page--;
            vm.presentationsType = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.afterCreate = () => {
            if (vm.viewMode == 'list') {
                vm.page = 1;
            }
            vm.presentationsType = null;
            vm.nextTable();
        };

        vm.afterDelete = param => {
            console.log('afterDelete', param);
            vm.page = 0;
            vm.presentationsType = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.viewChange = () => {
            vm.viewMode = vm.viewMode == 'list' ? 'table' : 'list';
            if (vm.viewMode == 'list') {
                vm.page = 0;
                vm.presentationsType = null;
                vm.nextPage().then(() => {}, () => {});
            } else {
                vm.page--;
                vm.presentationsType = null;
                vm.nextPage().then(() => {}, () => {});
            }
        };

        $scope.$watch('searchText', searchText => {
            vm.page = 0;
            vm.presentationsType = null;
            vm.found = 0;
            vm.nextPage().then(() => {}, () => {});
        }, true);
    }

})();