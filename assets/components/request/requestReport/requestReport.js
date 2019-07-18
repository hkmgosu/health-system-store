(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-report></ssvq-request-report>
     */
    app.directive('ssvqRequestReport', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestReport/requestReport.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
        vm.labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        vm.series = ['Reclamo', 'Felicitaciones', 'Sugerencia'];

        vm.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90],
            [28, 48, 40, 19, 86, 27, 90]
        ];
    }
})();