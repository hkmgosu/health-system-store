(function () {
    'use strict';
    /**
     * Example
     * <ssvq-autoconsulta-frame key=""></ssvq-autoconsulta-frame>
     */
    app.directive('ssvqAutoconsultaFrame', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/intranet/autoconsultaFrame/autoconsultaFrame.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();