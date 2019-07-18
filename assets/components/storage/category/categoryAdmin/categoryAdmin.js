(function() {
    'use strict';
    /**
     * Example
     * <ssvq-storage-category-admin></ssvq-storage-category-admin>
     */
    app.directive('ssvqStorageCategoryAdmin', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/category/categoryAdmin/categoryAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, categoryFactory) {
        let vm = this;
        window._vm = this;
        vm.showSearch = false;
        vm.showLoading = 0;
        vm.searchText = '';
        vm.category = null;
        vm.breadcrumbs = [];

        vm.reloadList = (category) => {
            // buscar si categoria existe en breadcrumbs
            // eliminar desde la posicion a la derecha
            let newBreadcrumbs = [];
            for (let i = 0; i < vm.breadcrumbs.length; ++i) {
                if (vm.breadcrumbs[i].id == category.id) {
                    vm.breadcrumbs = newBreadcrumbs;
                    break;
                }
                newBreadcrumbs.push(vm.breadcrumbs[i]);
            }

            vm.category = category;
            vm.childrenList = [];
            if (category) {
                // obtiene breadcrumbs
                if (vm.searchText > '') {
                    vm.searchText = '';
                    vm.showLoading++;
                    vm.showSearch = false;
                    vm.breadcrumbs = [];
                    categoryFactory.getBreadcrumbs({
                        id: vm.category.id
                    }).then(
                        response => {
                            vm.breadcrumbs = response.obj.categories;
                            vm.showLoading--;
                        }
                    );
                } else {
                    vm.breadcrumbs.push(category);
                }

                // obtener subcategorías
                vm.showLoading++;
                categoryFactory.getAll({
                    where: {
                        category: vm.category.id
                    }
                }).then(
                    response => {
                        vm.childrenList = response.obj.categories;
                        vm.showLoading--;
                    }
                );
            } else {
                // obtener categorías
                vm.showLoading++;
                categoryFactory.getAll({
                        where: {
                            category: null
                        }
                    })
                    .then(response => {
                        vm.childrenList = response.obj.categories;
                        vm.showLoading--;
                    });
                vm.breadcrumbs = [];
            }
        };

        // Obtener lista de categorías
        vm.reloadList(false);

        vm.addCategory = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/category/categoryAdmin/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.category = {
                        description: '',
                        active: true
                    };
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.category);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataCreate => {
                if (_.isEmpty(dataCreate)) {
                    return;
                }
                $mdToast.showSimple('Guardando categoría...');

                // crear categoría
                dataCreate.category = vm.category ? vm.category.id : null;
                categoryFactory.create(dataCreate).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha creado la categoría');
                        $mdDialog.hide();
                        dataReturn.ok && vmParent.reloadList(vmParent.category, true);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo crear la categoría')
                );
            });
        };

        vm.onEditItem = (category, $event) => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/category/categoryAdmin/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.category = angular.copy(category);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.category);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando categoría...');

                // guardar subcategoría
                categoryFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdDialog.hide();
                        $mdToast.showSimple('Se ha modificado la categoría');
                        if (dataReturn.ok) {
                            let i = vmParent.breadcrumbs.length - 1;
                            if (i >= 0 && vmParent.breadcrumbs[i].id == dataReturn.obj.category.id) {
                                vmParent.category = dataReturn.obj.category;
                                vmParent.breadcrumbs[i] = dataReturn.obj.category;
                            } else {
                                vmParent.reloadList(vmParent.category, true);
                            }
                        }
                    },
                    // fail
                    err => $mdToast.showSimple(
                        'No se pudo modificar la categoría. ' + (err.raw.message || '')
                    )
                );
            });
        };

        vm.onDeleteItem = (category, $event) => {
            let vmParent = vm;
            let message = $translate.instant('CATEGORY.DIALOG.DELETE_MESSAGE') +
                ' ' + category.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('CATEGORY.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('CATEGORY.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('CATEGORY.DIALOG.TITLE'))
                .cancel($translate.instant('CATEGORY.DIALOG.CANCEL'))
            ).then(
                function() {
                    // eliminar subcategoría
                    categoryFactory.delete(category.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado la categoría ' +
                                response.obj.category.description);
                            response.ok && vmParent.reloadList(vmParent.category, true);
                        },
                        // fail
                        err => $mdToast.showSimple(
                            'Hubo un problema al eliminar. ' + (err.message || '')
                        )
                    );
                },
                function() {
                    console.log(vm, $scope);
                } // cancelo
            );
        };

        $scope.$watch('vm.searchText', searchText => {
            if (searchText > '') {
                vm.breadcrumbs = [];
                vm.searchText = searchText;
                vm.category = null;
                categoryFactory.getAll({
                    filter: searchText
                }).then(
                    response => vm.childrenList = response.obj.categories
                );
            } else {
                vm.showSearch = false;
            }
        });
    }
})();