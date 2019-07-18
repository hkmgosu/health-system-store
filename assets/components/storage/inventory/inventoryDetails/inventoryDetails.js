(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-inventory-details></ssvq-storage-inventory-details>
     */
    app.directive('ssvqStorageInventoryDetails', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/inventory/inventoryDetails/inventoryDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $stateParams, $mdDialog, $mdToast, inventoryFactory, unitProductsManagerFactory) {
        var vm = this;

        vm.inventoryDetail = null;
        vm.inventory = null;
        vm.units = [];
        vm.loading = true;

        // requerido para imagen de producto
        vm.timestamp = product => moment((product || {}).updatedAt).format('X');

        inventoryFactory.get($stateParams.id).then(result => {
            let isValid = true;
            result.obj.inventory.detail.forEach(detail => {
                if (detail.realStock === null) isValid = false;
            });
            vm.inventory = {
                ...result.obj.inventory,
                isValid
            };
            vm.inventoryDetail = result.obj.detail;
            vm.units.push(vm.inventory.unit);
            vm.loading = false;
            $scope.$apply();
        });

        vm.showItemDetail = ($event, item) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/inventory/inventoryDetails/dialogDetail.html',
                controller: function($mdDialog) {
                    let vm = this;
                    vm.inventoryDetail = {
                        id: null,
                        inventory: null,
                        product: null,
                        realStock: null,
                        observation: null
                    }
                    vm.inventoryDetail.id = item.id;
                    vm.inventoryDetail.inventory = item.inventory;
                    vm.inventoryDetail.product = item.product
                    vm.inventoryDetail.realStock = Number.parseInt(item.realStock);
                    vm.inventoryDetail.observation = item.observation;


                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.inventoryDetail);
                },
                bindToController: true,
                controllerAs: 'vm',
                locals: {
                    inventories: vm.inventories,
                    inventory: vm.inventory
                }
            }).then(
                // dialog confirm
                dataConfirm => {
                    if (_.isEmpty(dataConfirm)) {
                        return;
                    }
                    vm.loading = true;
                    $mdToast.showSimple('Actualizando Inventario...');
                    inventoryFactory.updateInventoryDetail(_.pick(dataConfirm, ["id", "realStock", "observation"])).then(
                        // success
                        updated => {
                            $mdToast.showSimple('Se ha actualizado el inventario');
                            vm.inventoryDetail.forEach(element => {
                                if (element.id === updated.obj.id) {
                                    element.realStock = updated.obj.realStock;
                                    element.observation = updated.obj.observation;
                                    element.isValid = true;
                                }
                            });
                            let inventory = _.find(vm.inventories, {
                                id: updated.obj.inventory
                            });
                            let detailIsInvalidExist = _.find(vm.inventoryDetail, detail => detail.realStock === null);
                            if (!detailIsInvalidExist && inventory) {
                                inventory.isValid = true;
                                vm.inventory.isValid = true;
                            }
                            vm.loading = false;
                            $scope.$apply();
                            $mdDialog.hide();
                        },
                        // fail
                        error => {
                            vm.loading = false;
                            $mdToast.showSimple(error.raw ? error.raw.message : error.msg)
                        }
                    );
                }
            );
        }



        vm.updateInventoryObservation = () => {
            vm.loading = true;
            $mdToast.showSimple('Actualizando observaciones del inventario...');
            inventoryFactory.update({
                id: vm.inventory.id,
                observation: vm.inventory.observation
            }).then(
                // success
                updated => {
                    $mdToast.showSimple('Se ha actualizado el inventario');
                    vm.formGeneral.$setPristine();
                    vm.formGeneral.$setUntouched();
                    vm.loading = false;
                    $mdDialog.hide();
                },
                // fail
                error => {
                    vm.loading = false;
                    $mdToast.showSimple(error.raw ? error.raw.message : error.msg)
                }
            );
        }

        vm.timestamp = product => moment((product || {}).updatedAt).format('X');



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

        vm.getArrayBody = (array, index) => {

            var swStockValue, swStockStyle, realStockValue, realStockStyle;

            if (array.realStock !== null && array.realStock >= 0) {
                realStockValue = array.realStock;
                realStockStyle = 'numero';
                swStockValue = array.softwareStock;
                swStockStyle = 'numero';
            } else {
                realStockValue = '';
                swStockValue = '';
                realStockStyle = 'rojo';
                swStockStyle = 'rojo';
            }

            var arr = [{
                    text: index,
                    alignment: 'right'
                },
                {
                    text: array.product.description
                },
                {
                    text: swStockValue,
                    style: swStockStyle
                },
                {
                    text: realStockValue,
                    style: realStockStyle
                }
            ];

            return arr;
        };

        vm.getArrayTable = () => {
            var arr = [];
            var index = 1;

            arr[0] = [{
                    text: '#',
                    fontSize: 10,
                    style: 'tableHeader'
                },
                {
                    text: 'Producto',
                    fontSize: 10,
                    style: 'tableHeader'
                },
                {
                    text: 'Stock',
                    fontSize: 10,
                    style: 'tableHeader'
                },
                {
                    text: 'Stock Real',
                    fontSize: 10,
                    style: 'tableHeader'
                }

            ];

            var count = 1;

            for (var i in vm.inventoryDetail) {
                arr[count] = vm.getArrayBody(vm.inventoryDetail[i], index);
                count++;
                index++;
            }

            return arr;
        };

        vm.getWidthTablePdf = () => {
            var arr = [];
            var count = 0;

            for (var i = 0; i < 3; i++) {

                if (count == 0) {
                    arr[count++] = 'auto';
                }

                arr[count++] = '*';

            }

            return arr;
        };

        vm.getBodyFilter = (key, value) => {

            var arr = {
                cell: []
            };

            arr.cell.push({
                text: key || '',
                style: 'filtro'
            });

            arr.cell.push({
                text: value || '',
                style: 'filtro'
            });

            return arr['cell'];
        };

        vm.getArrayFilter = () => {
            var arr = [];
            var count = 0;

            var key = '',
                value = '';

            key = 'U. Administrativa: ';
            value = vm.inventory.unit.name;

            arr[count++] = vm.getBodyFilter(key, value);

            key = 'Fecha: ';
            var fecha = moment.parseZone(vm.inventory.updatedAt).local().format("DD/MM/YYYY [ a las ] HH:mm");

            arr[count++] = vm.getBodyFilter(key, fecha);

            var estado;
            for (var i in vm.inventoryDetail) {
                if (vm.inventoryDetail[i].realStock !== null && vm.inventoryDetail[i].realStock >= 0) {
                    estado = 'Confirmado';
                } else {
                    estado = 'No Confirmado';
                    break;
                }
            }

            arr[count++] = vm.getBodyFilter('Estado: ', estado);

            return arr;
        };

        vm.generatePdf = () => {
            return pdfMake.createPdf({
                pageSize: 'LETTER',
                pageOrientation: 'portrait',
                pageMargins: [25, 160, 25, 30],
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
                                        text: 'Emitido el ' + (moment().local().format('D [-] MMMM [-] YYYY, hh:mm:ss a')),
                                        style: 'column3'
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders'

                    },
                    {

                        margin: [25, 10, 25, 0],
                        table: {
                            widths: ['100%'],
                            headerRows: 0,
                            body: [
                                [{
                                    text: 'INVENTARIO',
                                    style: 'column2'
                                }]
                            ]
                        },
                        layout: 'noBorders'

                    }, {
                        margin: [25, 10, 10, 10],
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
                            widths: vm.getWidthTablePdf(),
                            body: vm.getArrayTable()


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
                    },
                    rojo: {
                        color: '#FF0000',
                        bold: true,
                        alignment: 'center'
                    },
                    numero: {
                        alignment: 'right'
                    }
                }
            }).download("reporte_inventario_" + (moment().format('X')) + ".pdf");
        };

        vm.downloadReportPdf = () => {
            vm.loading = true;

            vm.generatePdf();
            vm.loading = false;
        }

    }
})();