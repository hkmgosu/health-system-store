(function() {
    'use strict';
    /**
     * Example
     * <ssvq-report-consolidated-products key=""></ssvq-report-consolidated-products>
     */
    app.directive('ssvqReportConsolidatedProducts', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/report/reportConsolidatedProducts/reportConsolidatedProducts.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdSidenav, $mdToast, storageReportFactory) {
        var vm = this;
        vm.limit = 15;
        vm.page = 1;
        vm.found = 0;

        vm.colTitles = {
            'tipo_producto': 'Tipo Producto',
            'lote': 'Lote',
            'cod_producto': 'Cod Producto',
            'producto': 'Producto',
            'stock_actual': 'Stock Actual',
            'precio_ponderado': 'Precio Ponderado'
        };

        vm.loading = false;

        vm.disabledReports = () => {
            vm.loading = (vm.found > 0) ? false : true;
        };

        vm.logoImg = null;

        vm.toDataUrl = (file, callback) => {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function() {
                var reader = new FileReader();
                reader.onloadend = function() {
                    callback(reader.result);
                }
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', file);
            xhr.send();
        };

        vm.toDataUrl('/assets/images/logo.jpg', base64Img => {
            vm.logoImg = base64Img;
        });

        vm.nextPage = () => {

            vm.getReportFilter();
        }

        vm.getReportFilter = () => {
            storageReportFactory.getConsolidatedProducts({
                page: vm.page,
                limit: vm.limit
            }).then(
                requests => {
                    vm.requests = requests.rows;
                    vm.found = requests.found;
                    vm.disabledReports()
                },
                error => {
                    vm.requests = [];
                    $mdToast.showSimple('No se pudo realizar la consulta');
                    vm.disabledReports()
                }
            );
        };

        vm.getReportFilter();

        vm.getCurrentDate = () => {
            var date = new Date();
            var year = date.getFullYear();
            var month = (('0' + (date.getMonth() + 1)).length == 2) ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);
            var day = (('0' + date.getDate()).length == 2) ? ('0' + date.getDate()) : date.getDate();

            return day + '-' + month + '-' + year;
        };

        vm.getArrayXlsx = () => {
            var arr = [];

            arr[0] = ['Tipo Producto', 'Cod Producto', 'Producto', 'Stock Actual', 'Precio Ponderado'];

            var count = 0;
            for (var i in vm.requestsXlsx) {
                count++;

                var arr2 = [];
                var count2 = 0;
                for (var j in vm.requestsXlsx[i]) {
                    arr2[count2] = vm.requestsXlsx[i][j];
                    count2++;
                }
                arr[count] = arr2;
            }

            return arr;
        };

        vm.generateXLSX = () => {

            var wb = XLSX.utils.book_new();

            wb.SheetNames.push("reporte");
            var ws_data = vm.getArrayXlsx();

            var ws = XLSX.utils.aoa_to_sheet(ws_data);

            wb.Sheets["reporte"] = ws;

            let filename = 'reporte_productos_consolidados_' + (moment().format('X')) + '.xlsx';
            XLSX.writeFile(wb, filename);
        };

        vm.downloadReport = () => {

            vm.loading = true;

            storageReportFactory.getConsolidatedProducts({}).then(
                requests => {
                    vm.requestsXlsx = requests.rows;
                    vm.generateXLSX();
                    vm.loading = false;
                },
                error => {
                    vm.requestsXlsx = [];
                    $mdToast.showSimple('No se pudo realizar la consulta')
                }
            );

        };

        vm.getArrayHeader = array => {
            var arr = {
                cell: []
            };

            var flag = true;
            for (var key in array) {
                if (flag) {
                    arr.cell.push({
                        text: '#',
                        fontSize: 10,
                        style: 'tableHeader'
                    });
                    flag = false;
                }

                arr.cell.push({
                    text: vm.colTitles[key],
                    fontSize: 10,
                    style: 'tableHeader'
                });
            }

            return arr['cell'];
        };

        vm.getArrayBody = (array, index) => {

            var arr = {
                cell: []
            };

            var flag = true;
            for (var key in array) {

                if (flag) {
                    arr.cell.push({
                        text: index,
                        alignment: 'right'
                    });
                    flag = false;
                }

                arr.cell.push({
                    text: array[key]
                });
            }
            return arr['cell'];
        };

        vm.getArrayTable = array => {
            var arr = [];
            var index = 1;

            arr[0] = vm.getArrayHeader(array[0]);

            var count = 0;
            for (var i in array) {
                count++;
                arr[count] = vm.getArrayBody(array[i], index);
                index++;
            }


            return arr;
        };

        vm.getWidthTablePdf = array => {
            var arr = [];
            var count = 0;

            for (var i in array) {

                if (count == 0) {
                    arr[count] = 'auto';
                    count++;
                }

                arr[count] = '*';
                count++;

            }

            return arr;
        };


        vm.generatePdf = () => {
            return pdfMake.createPdf({
                pageSize: 'LETTER',
                pageOrientation: 'landscape',
                pageMargins: [25, 150, 25, 30],
                header: [{

                        margin: [10, 10, 10, 10],
                        table: {
                            widths: ['50%', '50%'],
                            headerRows: 0,
                            body: [
                                [{
                                        image: vm.logoImg,
                                        width: 50,
                                        style: 'column1'
                                    },
                                    {
                                        text: 'Emitido el ' + (moment().format('D [-] MMMM [-] YYYY, hh:mm:ss a')),
                                        style: 'column3'
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders'

                    },
                    {

                        margin: [25, 40, 25, 0],
                        table: {
                            widths: ['100%'],
                            headerRows: 0,
                            body: [
                                [{
                                    text: 'PRODUCTOS CONSOLIDADOS',
                                    style: 'column2'
                                }]
                            ]
                        },
                        layout: 'noBorders'

                    }
                ],
                content: [

                    {
                        style: 'contentTable',
                        table: {
                            headerRows: 1,
                            widths: vm.getWidthTablePdf(vm.requestsPdf[0]),
                            body: vm.getArrayTable(vm.requestsPdf)


                        },
                        layout: {
                            fillColor: function(i, node) {
                                return (i % 2 === 0) ? '#C5E1F9' : '#EDF5FC';
                            }
                        }
                    }
                ],
                footer: function(currentPage, pageCount) {
                    return {
                        text: "Página " + currentPage.toString() + ' de ' + pageCount,
                        alignment: 'center',
                        style: 'normalText'

                    };
                },
                styles: {
                    column1: {
                        alignment: 'left',
                        fontSize: 8
                    },
                    column2: {
                        alignment: 'center',
                        bold: true,
                        fontSize: 12
                    },
                    column3: {
                        alignment: 'right',
                        fontSize: 8
                    },
                    dateReport: {
                        alignment: 'right',
                        fontSize: 8
                    },
                    header: {
                        fontSize: 12,
                        bold: true,
                        alignment: 'center'
                    },
                    filtro: {
                        alignment: 'left',
                        fontSize: 10
                    },
                    tableHeader: {
                        fillColor: '#3380BF',
                        color: '#FFFFFF',
                        bold: true,
                        alignment: 'center'
                    },
                    contentTable: {
                        fontSize: 8
                    }
                }
            }).download("reporte_productos_consolidados_" + (moment().format('X')) + ".pdf");
        };

        vm.downloadReportPdf = () => {
            vm.loading = true;

            storageReportFactory.getConsolidatedProducts({}).then(
                requests => {
                    vm.requestsPdf = requests.rows;
                    vm.generatePdf();
                    vm.loading = false;
                },
                error => {
                    vm.requestsPdf = [];
                    $mdToast.showSimple('No se pudo realizar la consulta')
                }
            );


        };
    }
})();