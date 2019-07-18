(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-report-products-received></ssvq-storage-report-products-received>
     */
    app.directive('ssvqStorageReportProductsReceived', function() {
        return {
            scope: {},
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                productRequest: '='
            },
            restrict: 'E',
            templateUrl: '/components/storage/productRequest/reportProductsReceived/reportProductsReceived.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $mdToast, productRequestFactory, costCenterFactory) {
        var vm = this;

        vm.openRangeDates = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/storage/productRequest/reportProductsReceived/rangeDate.html',
                controller: function($mdDialog) {
                    var vm = this;
                    vm.minDate = new Date((new Date).getFullYear(), 0, 1, 0, 0, 0, 1);
                    vm.maxDate = new Date();
                    vm.today = new Date();
                    vm.confirm = () => {
                        $mdDialog.hide();
                        downloadPdf(vm.minDate, vm.maxDate);
                    };
                    vm.cancel = $mdDialog.hide;
                },
                controllerAs: 'vm'
            });
        };




        // leer el logo del reporte
        let logoImg = null;
        (function getLogo() {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function() {
                var reader = new FileReader();
                reader.onloadend = function() {
                    logoImg = reader.result;
                }
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', '/assets/images/logo.jpg');
            xhr.send();
        })();



        function downloadPdf(desde, hasta) {
            vm.desde = desde;
            vm.hasta = hasta;
            getShipping().then(generaPdf);
        }


        function getPdfHeader() {
            return [{
                margin: 25,
                layout: 'noBorders',
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [{
                                image: logoImg,
                                width: 50,
                                style: 'column1'
                            },
                            {
                                text: moment().format('D [de] MMMM [de] YYYY hh:mm:ss a'),
                                style: 'column3'
                            }
                        ]
                    ]
                },
            }];
        }

        function getPdfEncab() {
            let content = [];
            content.push({
                style: 'titlePage',
                text: "Detalle Recepción para Bodega de " + (vm.productRequest.isPharmaceutical ? "Farmacia" : "Economato") + "\n\n"
            });

            let tableEncab = {
                widths: ['*', '*'],
                body: []
            };

            tableEncab.body.push([{
                text: 'Factura',
                style: 'textRightEncab'
            }, '_____________________']);

            let costCenter = vm.costCenter && vm.costCenter.description || '_____________________';

            tableEncab.body.push([{
                text: 'Centro Costo',
                style: 'textRightEncab'
            }, costCenter]);

            tableEncab.body.push([{
                text: 'Orden de Compra',
                style: 'textRightEncab'
            }, '_____________________']);

            tableEncab.body.push([{
                text: 'Proveedor',
                style: 'textRightEncab'
            }, '_____________________']);

            tableEncab.body.push([{
                text: 'Fecha Recepción',
                style: 'textRightEncab'
            }, moment().format('DD/MM/YYYY')]);

            tableEncab.body.push([{
                text: 'Rango de Fechas',
                style: 'textRightEncab'
            }, moment(vm.desde).format('DD/MM/YYYY') + ' - ' + moment(vm.hasta).format('DD/MM/YYYY')]);

            tableEncab.body.push([{
                text: 'Observaciones',
                style: 'textRightEncab'
            }, (vm.productRequest.glosa || '(sin comentarios)') + "\n\n"]);

            content.push({
                layout: 'noBorders',
                table: tableEncab
            });
            return content;
        }

        function getPdfDetail(shippings) {
            let content = [];

            let tableDetalle = {
                style: {
                    width: '50%'
                },
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: []
            };

            tableDetalle.body.push([{
                    style: 'sHeaderTable',
                    text: "Codigo"
                },
                {
                    style: 'sHeaderTable',
                    text: "Descripción"
                },
                {
                    style: 'sHeaderTable',
                    text: "Fecha Vto."
                },
                {
                    style: 'sHeaderTable',
                    text: "N° Lote"
                },
                {
                    style: 'sHeaderTable',
                    text: "Cantidad"
                },
                {
                    style: 'sHeaderTable',
                    text: "Precio Unitario"
                },
                {
                    style: 'sHeaderTable',
                    text: "Monto\nNeto"
                }
            ]);

            let valColumn = val => {
                let num = Number(val);
                if (!val) return ' ';
                if (isNaN(num)) return val;
                return num.toLocaleString('es');
            };

            let totalPrice = 0;
            shippings.forEach(el => {
                let totalItem = el.productRequestDetail.product.weightedPrice * el.quantityReceived;
                totalPrice += totalItem;
                let expiration = '---Sin fecha---';
                let lot = '--Sin Lote---';
                if (el.originProductStock && el.originProductStock.productLot) {
                    if (el.originProductStock.productLot.expiration) {
                        expiration = moment(el.originProductStock.productLot.expiration).format("DD/MM/YYYY");
                    }
                    if (el.originProductStock.productLot.lot) {
                        lot = el.originProductStock.productLot.lot;
                    }
                }

                tableDetalle.body.push([
                    // codigo
                    el.productRequestDetail.product.productCode,
                    // producto
                    el.productRequestDetail.product.description,
                    // vencimiento
                    expiration,
                    // lote
                    lot,
                    // cantidad recibida
                    {
                        style: 'colNumber',
                        text: el.quantityReceived
                    },
                    // precio ponderado
                    {
                        style: 'colNumber',
                        text: valColumn(el.productRequestDetail.product.weightedPrice)
                    },
                    // total ponderado
                    {
                        style: 'colNumber',
                        text: valColumn(totalItem)
                    }
                ]);
            });

            let totalIVA = Math.round(totalPrice * 0.19);
            let totalTotal = totalPrice + totalIVA;
            tableDetalle.body.push([{
                    style: 'sHeaderTable',
                    text: ''
                },
                {
                    style: 'sHeaderTable',
                    text: ''
                },
                {
                    style: 'sHeaderTable',
                    text: ''
                },
                {
                    style: 'sHeaderTable',
                    text: ''
                },
                {
                    style: 'sHeaderTable',
                    text: ''
                },
                {
                    style: 'sHeaderTableR',
                    text: 'NETO:\nIVA:\nTOTAL:'
                },
                // total itemes
                {
                    style: 'colNumber',
                    text: Number(totalPrice).toLocaleString('es') + '\n' +
                        Number(totalIVA).toLocaleString('es') + '\n' +
                        Number(totalTotal).toLocaleString('es')
                }
            ]);

            let layout = {
                fillColor: function(i, node) {
                    return (i % 2 === 0) ? '#C5E1F9' : '#EDF5FC';
                }
            };

            content.push({
                style: 'content',
                table: tableDetalle,
                layout
            });

            return content;
        }

        function getPdfSignatories() {
            let content = [];

            // sector de firmas
            let tableFirmas = {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*'],
                body: []
            };

            tableFirmas.body.push([{
                    border: [false, false, false, false],
                    text: ''
                }, {
                    border: [false, true, false, false],
                    text: 'Recepción Conforme'
                },
                {
                    border: [false, false, false, false],
                    text: ''
                }, {
                    border: [false, true, false, false],
                    text: 'Firma Jefe Bodega'
                },
                {
                    border: [false, false, false, false],
                    text: ''
                }
            ]);

            content.push("\n\n\n\n\n");
            content.push({
                style: 'content',
                table: tableFirmas,
            });
            content.push("\n\n");

            let employee = JSON.parse(localStorage.getItem('miSSVQ.me'));
            let nombreEmpleado = employee.name + ' ' + (employee.lastname || '') + ' ' + (employee.mlastname || '');
            let fecha = moment().format('DD-MM-YYYY');
            let hora = moment().format('h:mm a');
            content.push({
                style: 'content',
                layout: 'noBorders',
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        ['', 'Bodeguero: ' + nombreEmpleado +
                            '\nFecha: ' + fecha +
                            '\nHora: ' + hora
                        ]
                    ]
                }
            });

            return content;
        }

        function generaPdf(shippings) {
            if (!shippings) return;
            shippings.forEach(el => {
                el.productRequestDetail = vm.productRequest.details.find(det => det.id == el.productRequestDetail);
            });


            pdfMake.createPdf({
                pageSize: 'LETTER',
                pageOrientation: 'portrait',
                pageMargins: [25, 60, 25, 20],
                header: getPdfHeader(),
                content: [].concat(getPdfEncab(), getPdfDetail(shippings), getPdfSignatories()),
                // footer(page, pages) {},
                styles: {
                    sHeaderTable: {
                        fontSize: 10,
                        alignment: 'center',
                        bold: true,
                        fillColor: '#3380BF',
                        color: '#FFFFFF'
                    },
                    sHeaderTableR: {
                        fontSize: 10,
                        alignment: 'right',
                        bold: true,
                        fillColor: '#3380BF',
                        color: '#FFFFFF'
                    },
                    content: {
                        fontSize: 10
                    },
                    column3: {
                        alignment: 'right',
                        fontSize: 8
                    },
                    colNumber: {
                        alignment: 'right'
                    },
                    textRightEncab: {
                        alignment: 'right',
                        bold: true
                    },
                    titlePage: {
                        alignment: 'center',
                        bold: true,
                        fontSize: 12
                    }
                }
            }).download("Envios Recibidos - Solicitud " + vm.productRequest.correlative + ".pdf");
        }

        function getShipping() {
            let idDetails = vm.productRequest.details.reduce((acum, el) => acum.concat(el.id), []);
            let desde = moment(vm.desde).format("YYYY-MM-DD");
            let hasta = moment(vm.hasta).format("YYYY-MM-DD");
            vm.costCenter = null;

            return costCenterFactory.get(vm.productRequest.costCenter || 0)
                .then(res => vm.costCenter = res.obj.costCenter || null, err => {})
                .then(() => productRequestFactory.getShippings(idDetails))
                .then(res => res.obj.shippings)
                .then(shippings => shippings.filter(el => {
                    el.date = moment(el.date).format("YYYY-MM-DD");
                    return desde <= el.date && el.date <= hasta && el.quantityReceived;
                }))
                .catch(err => {
                    let message = (err.raw && err.raw.message) || err.raw || err;
                    $mdToast.showSimple(message);
                    console.error(err);
                });
        }
    }
})();