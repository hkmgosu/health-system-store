(() => {
    'use strict';
    /**
      * Example
      * <ssvq-rem-transfer-report-view></ssvq-rem-transfer-report-view>
      */
    app.directive('ssvqRemTransferReportView', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/rem/remTransferReportView/remTransferReportView.html'
        };
    });

    /* @ngInject */
    function ComponentController(remFactory) {
        var vm = this;
        vm.limit = 50;
        vm.page = 1;
        let filterDates;
        vm.updateReport = dates => {
            filterDates = dates;
            remFactory.getTransferWithoutPatientReport(dates).then(baseReport => vm.baseReport = baseReport);
        };
        vm.downloadReport = () => {
            var wb = {
                SheetNames: ['Reporte'],
                Sheets: {
                    'Reporte': XLSX.utils.json_to_sheet(vm.baseReport)
                }
            };
            let filename = 'SAMU ' + moment(filterDates.fromDate).format('DD-MM') + ' al ' + moment(filterDates.toDate).format('DD-MM') + '.xlsx';
            XLSX.writeFile(wb, filename);
        };
    }
})();