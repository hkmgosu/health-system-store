(() => {
    'use strict';
    /**
      * Example
      * <ssvq-viatic-closure-view></ssvq-viatic-closure-view>
      */
    app.directive('ssvqViaticClosureView', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { type: '@' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/viatic/viaticClosureView/viaticClosureView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $location, $mdToast, viaticClosureFactory) {
        var vm = this;

        viaticClosureFactory.getList({ type: vm.type }).then(closureList => {
            vm.closureList = closureList;
            $scope.$apply();
        }, err => $mdToast.showSimple('Ha ocurrido un error obteniendo la lista de cierres'));

        vm.createClosure = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/viatic/viaticClosureView/dialog.newClosure.html',
                controller:
                    /* @ngInject */
                    function DialogController($scope, $mdDialog, $viaticFactory, $mdToast) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.closure);

                        vm.closure = {};

                        var filter;

                        switch (vm.type) {
                            case 'partes': {
                                filter = {
                                    status: [9, 13],
                                    closurePartes: null
                                };
                                break;
                            }
                            case 'contabilidad': {
                                filter = {
                                    status: [10],
                                    closureContabilidad: null
                                };
                                break;
                            }
                            case 'tesoreria': {
                                filter = {
                                    status: [11],
                                    closureTesoreria: null
                                };
                                break;
                            }
                        }

                        $scope.$watch('vm.closure.viaticList', viaticList => {
                            if (_.isEmpty(viaticList)) { return; }
                            Object.assign(vm.closure, {
                                totalAmount: viaticList.filter(viatic => viatic.selected && viatic.status.type !== 'closed').reduce((total, viatic) => total + viatic.totalAmount, 0),
                                viaticCount: viaticList.filter(viatic => viatic.selected).length
                            });
                            vm.allSelected = viaticList.filter(viatic => viatic.selected).length == viaticList.length;
                        }, true);

                        vm.changeAllSelected = allSelected => {
                            vm.closure.viaticList = vm.closure.viaticList.map(viatic => Object.assign(viatic, { selected: allSelected }));
                        };

                        $viaticFactory.getList(filter).then(res => {
                            Object.assign(vm.closure, {
                                viaticList: _.orderBy(res.viatics, 'id')
                            });
                            $mdToast.showSimple('Lista de viáticos cargada correctamente');
                        });
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: { type: vm.type }
            }).then(closure => {
                $mdToast.showSimple('Creando cierre...');
                closure.viaticList = closure.viaticList.filter(viatic => viatic.selected).map(viatic => viatic.id);
                closure.type = vm.type;
                viaticClosureFactory.create(closure).then(viaticClosureCreated => {
                    $location.path('/viaticos/cierres/detalles/' + viaticClosureCreated.id);
                }, err => {
                    $mdToast.showSimple('Ha ocurrido un error');
                });
            });
        };
    }
})();