(() => {
    'use strict';
    /**
      * Example
      * <ssvq-home-view></ssvq-home-view>
      */
    app.directive('ssvqHomeView', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/homeView/homeView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdSidenav) {
        var vm = this;
        vm.showCategoryList = () => $mdSidenav('article-category').toggle();

        vm.filter = {
            category: { private: false }
        };

        vm.onCategoryChange = (category) => {
            vm.filter.category = category ? { id: category.id, private: false } : { private: false };
        };
        vm.onSearchTextChange = searchText => {
            vm.filter.searchText = searchText;
        };
    }
})();