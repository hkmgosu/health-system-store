(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-report-express-income-output></ssvq-storage-report-express-income-output>
     */
    app.directive('ssvqStorageReportExpressIncomeOutput', function() {
        return {
            scope: {},
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                expressIncome: '='
            },
            restrict: 'E',
            templateUrl: '/components/storage/expressIncome/reportExpressIncomeOutput/reportExpressIncomeOutput.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;

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

        vm.downloadPdf = () => {
            generaPdf();
        };


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

            content.push({
                style: 'titlePage',
                text: "Detalle Consumo Inmediato\n\n"
            });

            content.push({
                layout: 'noBorders',
                table: {
                    body: [
                        ["N° Consumo Inmediato: ", vm.expressIncome.id],
                        ["Programa: ", "_______________________________"],
                        ["Fecha: ", fecha],
                        ["Nombre establecimiento: ", "_______________________________"],
                        ["R.U.T.: ", "_______________________________"],
                        ["Dirección: ", "_______________________________"],
                        ["Comuna: ", "_______________________________"],
                        ["Servicio Salud: ", "_______________________________"]
                    ]
                }
            });

            content.push("\n\n");
            return content;
        }

        function getPdfDetail() {
            let content = [];

            let detallePedido = [
                [{
                        style: 'sHeaderTable',
                        text: "Codigo"
                    }, {
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
                        text: "Despachado"
                    }, {
                        style: 'sHeaderTable',
                        text: "Monto\nNeto"
                    }
                ]
            ];

            let totalPrice = 0;
            vm.expressIncome.details.forEach(el => {
                let monto = el.priceItem || el.product.weightedPrice * el.quantity;
                totalPrice += monto;

                let expiration = '---Sin fecha---';
                let lot = el.lot || '--Sin Lote---';
                if (el.expiration) expiration = moment(el.expiration).format('DD/MM/YYYY');

                detallePedido.push([
                    el.product.productCode,
                    el.product.description,
                    expiration,
                    lot,
                    {
                        style: 'colNumber',
                        text: Number(el.quantity).toLocaleString('es')
                    },
                    {
                        style: 'colNumber',
                        text: Number(monto).toLocaleString('es')
                    }
                ]);
            });

            let totalIVA = Math.round(totalPrice * 0.19);
            let totalTotal = totalPrice + totalIVA;
            detallePedido.push([{
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
                    text: 'TOTAL NETO:\nIVA:\nTOTAL:'
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
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
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

        function generaPdf() {
            pdfMake.createPdf({
                pageSize: 'LETTER',
                pageOrientation: 'portrait',
                pageMargins: [25, 60, 25, 20],
                header: getPdfHeader(),
                content: [].concat(getPdfEncab(), getPdfDetail(), getPdfSignatories()),
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
            }).download("Productos Salientes - Movimiento " + vm.expressIncome.id + ".pdf");
        }
    }
})();