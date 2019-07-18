(function () {
    'use strict';
    /**
     * Example
     * <ssvq-product-type-item-list productType="" fields=""></ssvq-product-type-item-list>
     */
    app.directive('ssvqProductTypeItemList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                productType: '=',
                fields: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/productType/productTypeItemList/productTypeItemList.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();