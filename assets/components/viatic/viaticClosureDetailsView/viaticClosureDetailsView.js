(() => {
    'use strict';
    /**
      * Example
      * <ssvq-viatic-closure-details-view></ssvq-viatic-closure-details-view>
      */
    app.directive('ssvqViaticClosureDetailsView', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/viatic/viaticClosureDetailsView/viaticClosureDetailsView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, viaticClosureFactory, $stateParams, $mdToast, $mdDialog) {
        var vm = this;
        let idViaticClosure = $stateParams.id;
        let jsonReport;

        const parserXlsx = (viaticList) => {
            jsonReport = _.map(viaticList, viatic => {
                return {
                    'Nº Resolución Exenta': viatic.numResExenta + ' / ' + moment(viatic.dateResExenta).format('DD-MM-YYYY'),
                    'Funcionario': viatic.owner.fullname,
                    'Run': viatic.owner.rut,
                    'Calidad Jurídica': (viatic.legalQuality || {}).name,
                    'Monto': viatic.totalAmount,
                    'Servicio': viatic.unit.name,
                    'Desde (dd-mm-yyyy)': moment(viatic.fromDate).format('DD-MM-YYYY'),
                    'Hasta (dd-mm-yyyy)': moment(viatic.toDate).format('DD-MM-YYYY')
                };
            });
        };

        viaticClosureFactory.getDetails(idViaticClosure).then(
            viaticClosure => {
                vm.viaticClosure = viaticClosure;
                parserXlsx(viaticClosure.viaticList);
                $scope.$apply();
            },
            err => $mdToast.showSimple('Ha ocurrido un error obteniendo el detalle del cierre')
        );

        vm.onChange = num => {
            vm.viaticClosure.viaticList = vm.viaticClosure.viaticList.map(viatic => {
                switch (vm.viaticClosure.type) {
                    case 'partes':
                        viatic.numResExenta = num++;
                        break;
                    case 'contabilidad':
                        viatic.numFolio = num;
                        break;
                    case 'tesoreria':
                        viatic.numFolioTesoreria = num;
                        break;
                }
                return viatic;
            });
        };

        vm.onDateChange = date => {
            vm.viaticClosure.viaticList = vm.viaticClosure.viaticList.map(viatic => {
                viatic.dateResExenta = date;
                return viatic;
            });
        };

        vm.onConfirm = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: 'Confirmación de cierre',
                    textContent: '¿Deseas confirmar el cierre?',
                    ok: 'Confirmar',
                    cancel: 'Volver'
                })
            ).then(() => {
                $mdToast.showSimple('Confirmando cierre...');
                let viaticClosure = angular.copy(vm.viaticClosure);
                switch (viaticClosure.type) {
                    case 'partes':
                        viaticClosure.viaticList = viaticClosure.viaticList.map(viatic => {
                            return {
                                id: viatic.id,
                                numResExenta: viatic.numResExenta,
                                dateResExenta: viatic.dateResExenta
                            };
                        });
                        break;
                    case 'contabilidad':
                        viaticClosure.viaticList = viaticClosure.viaticList.map(viatic => {
                            return {
                                id: viatic.id,
                                numFolio: viatic.numFolio
                            };
                        });
                        break;
                    case 'tesoreria':
                        viaticClosure.viaticList = viaticClosure.viaticList.map(viatic => {
                            return {
                                id: viatic.id,
                                numFolioTesoreria: viatic.numFolioTesoreria
                            };
                        });
                        break;
                }
                viaticClosureFactory.confirm(viaticClosure).then(() => {
                    vm.viaticClosure.confirmed = true;
                    $mdToast.showSimple('Se ha confirmado el cierre');
                }, () => $mdToast.showSimple('Ha ocurrido un error'));
            });
        };

        vm.downloadReport = () => {
            var wb = {
                SheetNames: ['Reporte'],
                Sheets: {
                    'Reporte': XLSX.utils.json_to_sheet(jsonReport)
                }
            };
            let filename = 'Reporte viaticos' + '.xlsx';
            XLSX.writeFile(wb, filename);
        };
    }
})();