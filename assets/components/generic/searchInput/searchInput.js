(function () {
    'use strict';
    /**
     * Example
     * <ssvq-search-input></ssvq-search-input>
     */
    app.directive('ssvqSearchInput', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                label: '@',
                searchText: '=',
                onChange: '&?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/generic/searchInput/searchInput.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;

        $scope.$watch('vm.searchText', (newValue, oldValue) => {
            if (newValue === oldValue) { return; }
            vm.onChange ? vm.onChange()(newValue) : null;
        }, true);
    }
})();