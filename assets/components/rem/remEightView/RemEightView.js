(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-eight-view key=""></ssvq-rem-eight-view>
     */
    app.directive('ssvqRemEightView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remEightView/RemEightView.html'
        };
    });

    /* @ngInject */
    function ComponentController(remFactory) {
        var vm = this;
        let filterDates;
        vm.updateReport = dates => {
            filterDates = dates;
            remFactory.getRemEight(dates).then(report => vm.report = report);
        };
        vm.downloadReport = () => {
            var wb = {
                SheetNames: ['Sección K', 'Sección L', 'Sección M', 'Sección N'],
                Sheets: {
                    'Sección K': XLSX.utils.table_to_sheet(document.getElementById('sectionK')),
                    'Sección L': XLSX.utils.table_to_sheet(document.getElementById('sectionL')),
                    'Sección M': XLSX.utils.table_to_sheet(document.getElementById('sectionM')),
                    'Sección N': XLSX.utils.table_to_sheet(document.getElementById('sectionN'))
                }
            };
            let filename = 'SAMU REM 08 ' + moment(filterDates.fromDate).format('DD-MM') + ' al ' + moment(filterDates.toDate).format('DD-MM') + '.xlsx';
            XLSX.writeFile(wb, filename);
        };
    }
})();