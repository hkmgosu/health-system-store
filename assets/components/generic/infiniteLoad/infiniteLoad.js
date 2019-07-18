(function () {
    'use strict';
    /**
     * Example
     * <ssvq-infinite-load next-page=""></ssvq-infinite-load>
     */
    app.directive('ssvqInfiniteLoad', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            scope: { nextPage: '&?' },
            restrict: 'A',
        };
    });

    /* @ngInject */
    function ComponentController($scope, $element, $compile) {
        let myElement = $element;
        let loadDisabled = false;
        let loadingElement = $($compile('<div layout="row" layout-align="center center" layout-padding class="hidden full-width"><md-progress-circular md-diameter="20px" md-mode="indeterminate"></md-progress-circular></div>')($scope));
        myElement.append(loadingElement);
        let onEventListener = _.debounce(() => {
            if (!loadDisabled && (myElement[0].scrollTop + myElement[0].clientHeight + 600 >= myElement[0].scrollHeight)) {
                loadingElement.removeClass('hidden');
                loadDisabled = true;
                $scope.nextPage()().then(() => {
                    loadingElement.addClass('hidden');
                    loadDisabled = false;
                }, () => {
                    loadingElement.addClass('hidden');
                    myElement.off('scroll', onEventListener);
                });
            }
        }, 600);
        myElement.on('scroll', onEventListener);
        $scope.$on('$destroy', () => myElement.off('scroll', onEventListener));
    }
})();