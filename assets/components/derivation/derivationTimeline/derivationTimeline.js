(function () {
    'use strict';
    /**
     * Example
     * <ssvq-derivation-timeline key=""></ssvq-derivation-timeline>
     */
    app.directive('ssvqDerivationTimeline', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/derivation/derivationTimeline/derivationTimeline.html'
        };
    });

    /* @ngInject */
    function ComponentController($derivationFactory, $stateParams, $mdToast, $scope) {
        var vm = this;
        let idDerivation = parseInt($stateParams.id);
        $derivationFactory.getTimeline(idDerivation).then(
            timeline => vm.timeline = timeline || [],
            err => $mdToast.showSimple('Error obteniendo actividad reciente')
        );

        let onSocketMessage = (event) => {
            if (event.id === idDerivation) {
                vm.timeline.push(event.data.log);
                $scope.$apply();
            }
        };
        io.socket.on('derivation', onSocketMessage);
        $scope.$on('$destroy', () => {
            $derivationFactory.unsubscribe(idDerivation);
            io.socket.off('derivation', onSocketMessage)
        });
    }
})();