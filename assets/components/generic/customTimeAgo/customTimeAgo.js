(() => {
    'use strict';
    /**
     * Example
     * <ssvq-custom-time-ago></ssvq-custom-time-ago>
     */
     app.directive('ssvqCustomTimeAgo', () => {
         return {
             controller      : ComponentController,
             controllerAs    : 'vm',
             bindToController: {
                timeAt: "="
             },
             restrict        : 'E',
             scope: {},
             templateUrl: '/components/generic/customTimeAgo/customTimeAgo.html'
         };
     });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
    }
})();