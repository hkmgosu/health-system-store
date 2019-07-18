(function() {
    'use strict';
    app.directive('ssvqReportCenabast', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/report/reportCenabast/reportCenabast.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdSidenav, $mdDialog, $mdToast, storageReportFactory, unitProductsManagerFactory) {
        var vm = this;

        vm.colTitles = {
            's_mes': 'Mes',
            'producto': 'Producto',
            'cod_producto': 'Cod Producto',
            'cantidad_programada': 'Cantidad Programada',
            'cantidad_recibida': 'Cantidad Recibida'
        };

        vm.limit = 15;
        vm.page = 1;

        vm.found = 0;
        vm.requests = [];

        vm.meses = [{
            id: 1,
            name: 'Enero'
        }, {
            id: 2,
            name: 'Febrero'
        }, {
            id: 3,
            name: 'Marzo'
        }, {
            id: 4,
            name: 'Abril'
        }, {
            id: 5,
            name: 'Mayo'
        }, {
            id: 6,
            name: 'Junio'
        }, {
            id: 7,
            name: 'Julio'
        }, {
            id: 8,
            name: 'Agosto'
        }, {
            id: 9,
            name: 'Septiembre'
        }, {
            id: 10,
            name: 'Octubre'
        }, {
            id: 11,
            name: 'Noviembre'
        }, {
            id: 12,
            name: 'Diciembre'
        }];

        vm.filter = {
            codProduct: null,
            productName: null,
            product: null,
            anio: null,
            mes: null
        };

        vm.searchUnits = [];

        vm.toggleFilter = () => {
            $mdSidenav('srequest-filter').toggle();
        };

        vm.loading = true;

        vm.disabledReports = () => {
            vm.loading = (vm.found > 0) ? false : true;
        };

        vm.logoImg = null;

        unitProductsManagerFactory.getAllowedUnits().then(obj => {
            vm.allowedUnits = obj.units;
            // dejarlas seleccionadas
            for (let i = 0; i < obj.units.length; ++i) {
                vm.searchUnits.push(obj.units[i].id);
            }
        });

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

        // limpiar el filtro
        vm.cleanFilter = () => {
            vm.filter = {
                codProduct: null,
                product: null,
                productName: null,
                anio: null,
                mes: null
            };

            vm.searchUnits = [];
            for (let i = 0; i < vm.allowedUnits.length; ++i) {
                vm.searchUnits.push(vm.allowedUnits[i].id);
            }

            vm.found = 0;
            vm.requests = [];
        };

        vm.nextPage = () => {
            vm.getReportFilter();
        };

        vm.onSelectProduct = product => {
            vm.filter.productName = product ? product.description : null;
            vm.filter.product = product ? product.id : null;
            vm.getReportFilter();
        };

        vm.getReportFilter = () => {
            if (!vm.filter.anio) {
                vm.found = 0;
                vm.requests = [];
                return;
            }

            storageReportFactory.getCenabast({
                units: vm.searchUnits,
                product: vm.filter.product,
                year: vm.filter.anio,
                month: vm.filter.mes,
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

        vm.getArrayXlsx = () => {
            var arr = [];

            arr[0] = ['Mes', 'Producto', 'Cod Producto', 'Cantidad Programada', 'Cantidad Recibida'];

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

            let filename = 'reporte_cenabast_' + (moment().format('X')) + '.xlsx';
            XLSX.writeFile(wb, filename);
        };

        vm.downloadReport = () => {

            vm.loading = true;

            storageReportFactory.getCenabast({
                units: vm.searchUnits,
                product: vm.filter.product,
                year: vm.filter.anio,
                month: vm.filter.mes
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

            key = 'Año: ';
            value = vm.filter.anio;

            arr[count++] = vm.getBodyFilter(key, value);


            arr[count++] = vm.getBodyFilter('Mes: ', ((vm.filter.mes ? _.find(vm.meses, {
                'id': vm.filter.mes
            }).name : 'Todos los meses')));

            return arr;
        };

        vm.generatePdf = () => {
            return pdfMake.createPdf({
                pageSize: 'LETTER',
                pageOrientation: 'portrait',
                pageMargins: [25, 180, 25, 30],
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
                                    text: 'CENABAST',
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
            }).download("reporte_cenabast_" + (moment().format('X')) + ".pdf");
        };

        vm.downloadReportPdf = () => {
            vm.loading = true;

            storageReportFactory.getCenabast({
                units: vm.searchUnits,
                product: vm.filter.product,
                year: vm.filter.anio,
                month: vm.filter.mes
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