(() => {
    'use strict';
    /**
      * Example
      * <ssvq-article-category-manager></ssvq-article-category-manager>
      */
    app.directive('ssvqArticleCategoryManager', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/article/articleCategoryManager/articleCategoryManager.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $articleCategoryFactory) {
        var vm = this;

        vm.breadcrumbs = [];

        $articleCategoryFactory.getList({ parent: null }).then(categoryList => {
            vm.categoryList = categoryList;
            $scope.$apply();
        });

        vm.createCategory = () => {
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
                bindToController: true
            }).then(category => {
                if (vm.mainCategory) { category.parent = vm.mainCategory.id };
                $articleCategoryFactory.create(category).then(categoryCreated => {
                    vm.categoryList.unshift(categoryCreated);
                    $mdToast.showSimple('La categoría ' + category.name + ' fue creada');
                    $scope.$apply();
                });
            });
        };

        vm.selectCategory = (category) => {
            vm.mainCategory = category;
            $articleCategoryFactory.getList({ parent: category ? category.id : null }).then(categoryList => {
                vm.categoryList = categoryList;
                $scope.$apply();
            });
            if (category && category.hierarchy) {
                $articleCategoryFactory.getBreadcrumbs(category.hierarchy).then(breadcrumbs => {
                    vm.breadcrumbs = breadcrumbs;
                    $scope.$apply();
                }, () => { });
            } else {
                vm.breadcrumbs = [];
            }
        };
    }
})();