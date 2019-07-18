(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-base-report-view key=""></ssvq-rem-base-report-view>
     */
    app.directive('ssvqRemBaseReportView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remBaseReportView/remBaseReportView.html'
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
            remFactory.getBaseReport(dates).then(baseReport => vm.baseReport = baseReport);
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