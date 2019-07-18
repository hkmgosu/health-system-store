(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-dashboard-view key=""></ssvq-rem-dashboard-view>
     */
    app.directive('ssvqRemDashboardView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remDashboardView/remDashboardView.html'
        };
    });

    /* @ngInject */
    function ComponentController(remFactory) {
        var vm = this;
        vm.callReport = {};
        vm.transferReport = {};
        vm.callReasonReport = {};

        vm.updateReports = dates => {
            /**
             * Obtener reporte de incidentes por motivo de llamada
             */
            remFactory.getReportByCallReason(dates).then(report => {
                vm.callReasonReport.labels = _.map(report, 'name');
                vm.callReasonReport.series = ['Incidentes'];
                vm.callReasonReport.data = [_.map(report, 'remCount')];
            });
            /**
             * Obtener reporte de llamadas válidas vs inválidas
             */
            remFactory.getCallReport(dates).then(report => {
                vm.callReportData = report;
                vm.callReport.labels = _.map(report, 'name');
                vm.callReport.data = _.map(report, 'count');
            });
            /**
             * Obtener reporte de traslados según categorías
             */
            remFactory.getTransferReport(dates).then(report => {
                vm.transferReport.series = ['Traslados primarios', 'Traslados secundarios'];
                vm.transferReport.labels = ['Básico', 'Avanzado', 'Medicalizado', 'Tripulación completa'];
                vm.transferReport.data = [
                    _.map(report.primary, 'count'),
                    _.map(report.secondary, 'count')
                ];
            });
        };
    }
})();