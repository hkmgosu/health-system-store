(function() {
    'use strict';
    /**
     * Example
     * <ssvq-report-expense-per-unit key=""></ssvq-report-bincard>
     */
    app.directive('ssvqReportExpensePerUnit', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/report/reportExpensePerUnit/reportExpensePerUnit.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdSidenav, $mdDialog, $mdToast, storageReportFactory, unitProductsManagerFactory) {
        var vm = this;
        var vmParent = this;

        vm.colTitles = {
            'solicitud': 'N° Solicitud',
            'bodega': 'Bodega',
            'fecha': 'Fecha',
            'monto': 'Monto'
        };

        vm.searchUnits = [];

        vm.limit = 15;
        vm.page = 1;

        vm.found = 0;
        vm.requests = null;

        vm.timestamp = () => moment(({}).updatedAt).format('X');

        vm.filter = {
            codProduct: null,
            productName: null,
            product: null,
            allowUnit: null,
            minDate: null,
            maxDate: null
        };

        vm.setProduct = () => {
            if (vm.filter.allowUnit) {
                vm.searchUnits = [vm.filter.allowUnit];
            } else {
                vm.searchUnits = [];
            }
            vm.getReportFilter();
        };

        vm.toggleFilter = () => {
            $mdSidenav('srequest-filter').toggle();
        };

        vm.disabledReports = () => {
            vm.loading = (vm.found > 0) ? false : true;
        };

        vm.loading = true;

        unitProductsManagerFactory.getAllowedUnits().then(obj => {
            vm.allowedUnits = obj.units
        });

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



        // Filtro por defecto:
        // Primero de enero del presente año, hasta fecha actual
        var datevm = new Date();
        vm.filter.minDate = new Date(datevm.getFullYear(), 0);
        vm.filter.maxDate = new Date();

        // limpiar el filtro
        vm.cleanFilter = () => {
            vm.filter = {
                codProduct: null,
                productName: null,
                product: null,
                allowUnit: null,
                minDate: new Date(datevm.getFullYear(), 0),
                maxDate: new Date()
            };
            vm.found = 0;
            vm.requests = [];
        };

        vm.nextPage = () => {
            vm.getReportFilter();
        }

        vm.onSelectProduct = product => {
            vm.filter.productName = product ? product.description : null;
            vm.filter.product = product ? product.id : null;
            vm.getReportFilter();
        };

        vm.getReportFilter = () => {
            if (!vm.filter.allowUnit) {
                vm.found = 0;
                vm.requests = [];
                return;
            }

            storageReportFactory.getExpensePerUnit({
                product: vm.filter.product,
                unit: vm.filter.allowUnit,
                minDate: vm.getDate(vm.filter.minDate),
                maxDate: vm.getDate(vm.filter.maxDate),
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

        // Mostrar filtro de fecha creación
        vm.showCreatedAtFilter = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/storage/report/reportExpensePerUnit/rangeDate.html',
                controller: function($mdDialog) {
                    var vm = this;
                    vm.filter = Object.assign({}, vmParent.filter);

                    vm.confirm = () => {
                        vmParent.filter.minDate = vm.filter.minDate;
                        vmParent.filter.maxDate = vm.filter.maxDate;
                        vmParent.getReportFilter();

                        $mdDialog.hide();
                    };
                    vm.cancel = () => {
                        $mdDialog.hide();
                    };
                },
                controllerAs: 'vm'
            });
        };

        vm.getDate = date => {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();

            return year + '-' + month + '-' + day;
        };

        vm.getCurrentDate = () => {
            var date = new Date();
            var year = date.getFullYear();
            var month = (('0' + (date.getMonth() + 1)).length == 2) ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);
            var day = (('0' + date.getDate()).length == 2) ? ('0' + date.getDate()) : date.getDate();

            return day + '-' + month + '-' + year;
        };

        vm.getDateFilter = date => {
            var year = date.getFullYear();
            var month = (('0' + (date.getMonth() + 1)).length == 2) ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1);
            var day = (('0' + date.getDate()).length == 2) ? ('0' + date.getDate()) : date.getDate();

            return day + '-' + month + '-' + year;
        };

        vm.getArrayXlsx = () => {
            var arr = [];

            arr[0] = ['N° Solicitud', 'Bodega', 'Fecha', 'Monto'];

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

            let filename = 'reporte_gasto_por_unidad_' + (moment().format('X')) + '.xlsx';
            XLSX.writeFile(wb, filename);
        };

        vm.downloadReport = () => {

            vm.loading = true;

            storageReportFactory.getExpensePerUnit({
                product: vm.filter.product,
                unit: vm.filter.allowUnit,
                minDate: vm.getDate(vm.filter.minDate),
                maxDate: vm.getDate(vm.filter.maxDate)
            }).then(
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

        vm.getBodyFilter = (key, value) => {

            var arr = {
                cell: []
            };

            arr.cell.push({
                text: key,
                style: 'filtro'
            });

            arr.cell.push({
                text: value,
                style: 'filtro'
            });

            return arr['cell'];
        };

        vm.getArrayFilter = () => {
            var arr = [];
            var count = 0;

            var key = '',
                value = '';

            key = 'Bodega: ';
            value = _.find(vm.allowedUnits, {
                'id': vm.filter.allowUnit
            }).name;

            arr[count++] = vm.getBodyFilter(key, value);

            key = 'Producto: ';
            value = vm.filter.productName ? vm.filter.productName : 'Todos los productos';

            arr[count++] = vm.getBodyFilter(key, value);

            arr[count++] = vm.getBodyFilter('Entre las fechas: ', (vm.getDateFilter(vm.filter.minDate) + ' y ' + vm.getDateFilter(vm.filter.maxDate)));

            return arr;
        };

        vm.generatePdf = () => {
            return pdfMake.createPdf({
                pageSize: 'LETTER',
                pageOrientation: 'landscape',
                pageMargins: [25, 186, 25, 30],
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
                                    text: 'GASTO POR UNIDAD',
                                    style: 'column2'
                                }]
                            ]
                        },
                        layout: 'noBorders'

                    }, {
                        margin: [25, 10, 10, 0],
                        table: {
                            widths: ['auto', '*'],
                            headerRows: 0,
                            body: vm.getArrayFilter()
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
            }).download("reporte_gasto_por_unidad_" + (moment().format('X')) + ".pdf");
        };

        vm.downloadReportPdf = () => {
            vm.loading = true;

            storageReportFactory.getExpensePerUnit({
                product: vm.filter.product,
                unit: vm.filter.allowUnit,
                minDate: vm.getDate(vm.filter.minDate),
                maxDate: vm.getDate(vm.filter.maxDate)
            }).then(
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