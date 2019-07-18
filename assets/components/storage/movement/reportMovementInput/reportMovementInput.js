(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-report-movement-input></ssvq-storage-report-movement-input>
     */
    app.directive('ssvqStorageReportMovementInput', function() {
        return {
            scope: {},
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                movement: '=',
                company: '=',
                destinyUnit: '='
            },
            restrict: 'E',
            templateUrl: '/components/storage/movement/reportMovementInput/reportMovementInput.html'
        };
    });

    /* @ngInject */
    function ComponentController(companyFactory, unitFactory) {
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
            content.push({
                style: 'titlePage',
                text: "Detalle Recepción para Bodega de " + (vm.movement.isPharmaceutical ? "Farmacia" : "Economato") + "\n\n"
            });

            console.log("destin", vm.movement);

            let tableEncab = {
                widths: ['*', '*'],
                body: []
            };

            let numInvoice = '_____________________';
            if (vm.movement.numInvoice) numInvoice = vm.movement.numInvoice;

            tableEncab.body.push([{
                text: 'Factura',
                style: 'textRightEncab'
            }, numInvoice]);

            tableEncab.body.push([{
                text: 'Centro Costo',
                style: 'textRightEncab'
            }, '_____________________']);

            let numPurchaseOrder = '_____________________';
            if (vm.movement.numPurchaseOrder) {
                numPurchaseOrder = vm.movement.numPurchaseOrder + '/' + vm.movement.yearPurchaseOrder;
            }

            tableEncab.body.push([{
                text: 'Orden de Compra',
                style: 'textRightEncab'
            }, numPurchaseOrder]);


            let company = null;
            if (!company && vm.company) company = vm.company.name;
            if (!company && vm.movement.donatedBy) company = vm.movement.donatedBy;
            if (!company && vm.destinyUnit) company = vm.destinyUnit.description;

            tableEncab.body.push([{
                text: 'Proveedor',
                style: 'textRightEncab'
            }, (company || '_____________________')]);

            tableEncab.body.push([{
                text: 'Fecha Recepción',
                style: 'textRightEncab'
            }, moment().format('DD/MM/YYYY')]);


            content.push({
                layout: 'noBorders',
                table: tableEncab
            });
            return content;
        }

        function getPdfDetail() {
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
            vm.movement.details.forEach(el => {
                let totalItem = el.priceItem ?
                    el.priceItem : el.product.weightedPrice * el.quantity;

                let priceItem = el.priceItem ?
                    Math.round(el.priceItem / el.quantity) : el.product.weightedPrice;

                totalPrice += totalItem;
                let expiration = '---Sin fecha---';
                let lot = el.lot || '--Sin Lote---';
                if (el.expiration) expiration = moment(el.expiration).format('DD/MM/YYYY');

                tableDetalle.body.push([
                    // codigo
                    el.product.productCode,
                    // producto
                    el.product.description,
                    // vencimiento
                    expiration,
                    // lote
                    lot,
                    // cantidad recibida
                    {
                        style: 'colNumber',
                        text: el.quantity
                    },
                    // precio ponderado
                    {
                        style: 'colNumber',
                        text: valColumn(priceItem)
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
                    text: valColumn(totalPrice) + '\n' +
                        valColumn(totalIVA) + '\n' +
                        valColumn(totalTotal)
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
            }).download("Productos Recibidos - Movimiento " + vm.movement.id + ".pdf");
        }
    }
})();