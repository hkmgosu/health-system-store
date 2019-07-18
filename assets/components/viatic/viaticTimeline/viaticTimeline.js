(() => {
    'use strict';
    /**
      * Example
      * <ssvq-viatic-timeline></ssvq-viatic-timeline>
      */
    app.directive('ssvqViaticTimeline', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { idViatic: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/viatic/viaticTimeline/viaticTimeline.html'
        };
    });

    /* @ngInject */
    function ComponentController($viaticFactory, $scope) {
        var vm = this;

        $viaticFactory.getTimeline(vm.idViatic).then(
            viaticTimeline => {
                vm.viaticTimeline = viaticTimeline;
                $scope.$apply();
            }, () => vm.viaticTimeline = []
        );

        var onSocket = function (event) {
            if (event.id != vm.idViatic) { return; }
            let eventData = event.data;
            switch (eventData.message) {
                case 'viaticLog': {
                    vm.viaticTimeline.unshift(eventData.data);
                    break;
                }
                case 'viaticComment': {
                    vm.viaticTimeline.unshift(eventData.data);
                    break;
                }
            }
            $scope.$apply();
        };
        io.socket.on('viatic', onSocket);
        $scope.$on('$destroy', function () {
            io.socket.off('viatic', onSocket);
        });
    }
})();