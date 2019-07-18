(() => {
    'use strict';
    /**
      * Example
      * <ssvq-article-category-selector></ssvq-article-category-selector>
      */
    app.directive('ssvqArticleCategorySelector', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                onChange: '&?',
                showPrivate: '=',
                mode: '@'
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/article/articleCategorySelector/articleCategorySelector.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $articleFactory, $articleCategoryFactory, $mdToast) {
        var vm = this;

        let getList;
        let criteria = {
            deleted: false
        };

        if (!_.isUndefined(vm.showPrivate)) { criteria.private = vm.showPrivate; }

        if (vm.mode === 'manager') {
            getList = $articleCategoryFactory.getManagedList;
        } else {
            getList = $articleCategoryFactory.getList;
        }

        getList(Object.assign({}, criteria, { parent: null })).then(categoryList => {
            vm.categoryList = categoryList;
        });

        vm.selectCategory = (category) => {
            vm.categorySelected = angular.copy(category);
            getList(Object.assign({}, criteria, { parent: category.id })).then(categoryList => {
                vm.categoryList = categoryList;
                $scope.$apply();
            });
            vm.onChange ? vm.onChange()(category) : null;
        };

        vm.backCategory = () => {
            let idCategory = vm.categorySelected.parent || null;
            async.parallel({
                categoryList: cb => getList(Object.assign({}, criteria, { parent: idCategory })).then(
                    list => cb(null, list), err => cb(err)
                ),
                categoryDetails: cb => $articleCategoryFactory.getDetails(idCategory).then(
                    details => cb(null, details), err => cb(err)
                )
            }, (err, results) => {
                if (err) {
                    console.log(err);
                    return $mdToast.showSimple('Ha ocurrido un error ');
                }
                vm.categoryList = results.categoryList;
                vm.categorySelected = results.categoryDetails;
                vm.onChange ? vm.onChange()(results.categoryDetails) : null;
                $scope.$apply();
            });
        };
    }
})();