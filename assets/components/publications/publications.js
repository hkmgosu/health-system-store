(() => {
    'use strict';
    /**
      * Example
      * <ssvq-publications category=""></ssvq-publications>
      */
    app.directive('ssvqPublications', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { category: '@' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/publications/publications.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
        vm.filter = { category: { id: parseInt(vm.category) } };

        vm.onSearchTextChange = searchText => {
            vm.filter.searchText = searchText;
        };
    }
})();