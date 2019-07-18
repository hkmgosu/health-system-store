(() => {
    'use strict';
    /**
      * Example
      * <ssvq-article-category-manager-item></ssvq-article-category-manager-item>
      */
    app.directive('ssvqArticleCategoryManagerItem', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { category: '=', onSelect: '&?' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/article/articleCategoryManagerItem/articleCategoryManagerItem.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $articleCategoryFactory, $mdToast, $element) {
        var vm = this;

        vm.editCategory = () => {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/article/articleCategoryManager/dialog.createCategory.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.category);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: { category: angular.copy(vm.category) }
            }).then(category => {
                $articleCategoryFactory.edit(category).then(() => {
                    vm.category = category;
                    $mdToast.showSimple('La categoría ' + category.name + ' fue editada');
                });
            });
        };

        vm.deleteCategory = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: 'Eliminación de categoría',
                    textContent: '¿Seguro que deseas eliminar la categoría?',
                    ok: 'Eliminar categoría',
                    ariaLabel: 'Eliminar categoría',
                    cancel: 'Cancelar'
                })
            ).then(() => {
                $articleCategoryFactory.delete(vm.category.id).then(() => {
                    $element.remove();
                    $mdToast.showSimple('La categoría ' + vm.category.name + ' fue eliminada');
                });
            });
        };

        vm.editCategoryManagerList = () => {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/article/articleCategoryManager/dialog.managerList.html',
                controller:
                    /* @ngInject */
                    function DialogController($scope, $mdDialog, $articleCategoryFactory) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();

                        $articleCategoryFactory.getManagerList(vm.category.id).then(
                            employeeList => vm.employeeList = employeeList
                        );

                        // Agregar persona
                        vm.addManager = employee => $articleCategoryFactory.addManager({
                            idManager: employee.id,
                            idArticleCategory: vm.category.id
                        }).then(() => {
                            vm.employeeList.unshift(employee);
                            $mdToast.showSimple('Se agregó el publicador autorizado');
                        }, () => { });
                        // Quitar persona
                        vm.removeManager = employee => $articleCategoryFactory.removeManager({
                            idManager: employee.id,
                            idArticleCategory: vm.category.id
                        }).then(() => {
                            _.remove(vm.employeeList, { id: employee.id });
                            $mdToast.showSimple('Se quitó el publicador autorizado');
                        });
                    },
                locals: { category: angular.copy(vm.category) },
                controllerAs: 'vm',
                bindToController: true
            }).then(() => { });
        };

        vm.selectCategory = () => vm.onSelect()(vm.category);
    }
})();