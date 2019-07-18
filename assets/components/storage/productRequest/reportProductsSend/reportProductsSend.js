(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-report-products-send></ssvq-storage-report-products-send>
     */
    app.directive('ssvqStorageReportProductsSend', function() {
        return {
            scope: {},
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                productRequest: '='
            },
            restrict: 'E',
            templateUrl: '/components/storage/productRequest/reportProductsSend/reportProductsSend.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $mdToast, productRequestFactory) {
        var vm = this;



        vm.openRangeDates = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/storage/productRequest/reportProductsSend/rangeDate.html',
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



        function downloadPdf(desde, hasta) {
            vm.desde = desde;
            vm.hasta = hasta;
            getShippings().then(generaPdf);
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
            let fecha = moment().format("DD [de] MMMM [de] YYYY");
            let desde = moment(vm.desde).format("DD/MM/YYYY");
            let hasta = moment(vm.hasta).format("DD/MM/YYYY");

            content.push({
                style: 'titlePage',
                text: "Guía de Despacho y Traslado\n\n"
            });

            content.push({
                layout: 'noBorders',
                table: {
                    body: [
                        ["N° Pedido: ", vm.productRequest.correlative],
                        // ["Programa: ", "_______________________________"],
                        ["Fecha: ", fecha],
                        ["Observaciones: ", (vm.productRequest.glosa || '(sin comentarios)')],
                        ["Nombre establecimiento: ", "_______________________________"],
                        ["R.U.T.: ", "_______________________________"],
                        ["Dirección: ", "_______________________________"],
                        ["Comuna: ", "_______________________________"],
                        ["Servicio Salud: ", "_______________________________"],
                        ["Rango Fechas: ", desde + " - " + hasta]
                    ]
                }
            });

            content.push("\n\n");
            return content;
        }

        function getPdfDetail(shippings) {
            let content = [];
            let detallePedido = [
                vm.productRequest.isPharmaceutical ? [{
                    style: 'sHeaderTable',
                    text: "Codigo"
                }, {
                    style: 'sHeaderTable',
                    text: "Descripción"
                }, {
                    style: 'sHeaderTable',
                    text: "Programa"
                }, {
                    style: 'sHeaderTable',
                    text: "Solicitado"
                }, {
                    style: 'sHeaderTable',
                    text: "Despachado"
                }, {
                    style: 'sHeaderTable',
                    text: "Recibido"
                }, {
                    style: 'sHeaderTable',
                    text: "Monto\nNeto"
                }] : [{
                    style: 'sHeaderTable',
                    text: "Codigo"
                }, {
                    style: 'sHeaderTable',
                    text: "Descripción"
                }, {
                    style: 'sHeaderTable',
                    text: "Solicitado"
                }, {
                    style: 'sHeaderTable',
                    text: "Despachado"
                }, {
                    style: 'sHeaderTable',
                    text: "Recibido"
                }, {
                    style: 'sHeaderTable',
                    text: "Monto\nNeto"
                }]
            ];

            let totalPrice = 0;
            vm.productRequest.details.forEach(el => {
                let quantitySend = shippings.reduce((acum, item) => {
                    return item.productRequestDetail == el.id ? acum + item.quantitySend : acum;
                }, 0);
                let quantityReceived = shippings.reduce((acum, item) => {
                    return item.productRequestDetail == el.id ? acum + item.quantityReceived : acum;
                }, 0);
                let monto = el.product.weightedPrice * quantitySend;
                totalPrice += monto;

                detallePedido.push(vm.productRequest.isPharmaceutical ? [
                    el.product.productCode,
                    el.product.description,
                    el.subprogram ? el.subprogram.description : '',
                    {
                        style: 'colNumber',
                        text: Number(el.quantity).toLocaleString('es')
                    },
                    {
                        style: 'colNumber',
                        text: Number(quantitySend).toLocaleString('es')
                    },
                    {
                        style: 'colNumber',
                        text: Number(quantityReceived).toLocaleString('es')
                    },
                    {
                        style: 'colNumber',
                        text: Number(monto).toLocaleString('es')
                    }
                ] : [
                    el.product.productCode,
                    el.product.description,
                    {
                        style: 'colNumber',
                        text: Number(el.quantity).toLocaleString('es')
                    },
                    {
                        style: 'colNumber',
                        text: Number(quantitySend).toLocaleString('es')
                    },
                    {
                        style: 'colNumber',
                        text: Number(quantityReceived).toLocaleString('es')
                    },
                    {
                        style: 'colNumber',
                        text: Number(monto).toLocaleString('es')
                    }
                ]);
            });

            let totalIVA = Math.round(totalPrice * 0.19);
            let totalTotal = totalPrice + totalIVA;
            detallePedido.push(vm.productRequest.isPharmaceutical ? [{
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
        ]: [{
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
                table: {
                    widths: vm.productRequest.isPharmaceutical ? ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'] : ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                    body: detallePedido,
                },
                layout
            });

            return content;
        }

        function getPdfSignatories() {
            let content = [];

            // sector de firmas
            let tableFirmas = {
                headerRows: 1,
                widths: ['*', 'auto', '*', 'auto', '*'],
                body: []
            };

            tableFirmas.body.push([{
                    border: [false, false, false, false],
                    text: ''
                }, {
                    border: [false, true, false, false],
                    text: 'Firma Recibi Conforme\nNombre y RUN Q.F. Director Técnico'
                },
                {
                    border: [false, false, false, false],
                    text: ''
                }, {
                    border: [false, true, false, false],
                    text: 'Nombre y Firma Q.F. Director\nTécnico Laboratorio o Droguería'
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
            }).download("Productos Enviados - Solicitud " + vm.productRequest.correlative + ".pdf");
        }

        function getShippings() {
            let idDetails = vm.productRequest.details.reduce((acum, el) => acum.concat(el.id), []);
            let desde = moment(vm.desde).format("YYYY-MM-DD");
            let hasta = moment(vm.hasta).format("YYYY-MM-DD");

            return productRequestFactory.getShippings(idDetails)
                .then(res => res.obj.shippings)
                .then(shippings => shippings.filter(el => {
                    el.date = moment(el.date).format("YYYY-MM-DD");
                    return desde <= el.date && el.date <= hasta;
                }))
                .catch(err => {
                    let message = (err.raw && err.raw.message) || err.raw || err;
                    $mdToast.showSimple(message);
                    console.error(err);
                });
        }
    }
})();