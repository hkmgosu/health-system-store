(() => {
    'use strict';
    /**
      * Example
      * <ssvq-article-list filter="{category: {}, searchText: ''}"></ssvq-article-list>
      */
    app.directive('ssvqArticleList', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { filter: '=', mode: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/article/articleList/articleList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $articleFactory) {
        var vm = this;

        vm.articleList = null;
        vm.page = 0;

        let getList;

        if (vm.mode === 'manager') {
            getList = $articleFactory.getManagedList;
        } else {
            getList = $articleFactory.getList;
        }

        vm.nextPage = () => new Promise((resolve, reject) => {
            vm.page++;
            getList({
                category: vm.filter.category,
                title: { contains: vm.filter.searchText || '' }
            }, { page: vm.page, limit: 10 }).then(articleList => {
                vm.articleList = _.concat(vm.articleList || [], articleList);
                $scope.$apply();
                resolve();
            }, () => {
                vm.articleList = vm.articleList || [];
                $scope.$apply();
                reject();
            });
        });

        $scope.$watch('vm.filter', filter => {
            vm.articleList = null;
            vm.page = 0;
            vm.nextPage().then(() => { }, () => { });
        }, true);
    }
})();