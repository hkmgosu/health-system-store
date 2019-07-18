(function () {
    'use strict';
    /**
     * Example
     * <ssvq-derivation-list filter=""></ssvq-derivation-list>
     */
    app.directive('ssvqDerivationList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                filter: '=',
                finished: '=',
                count: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/derivation/derivationList/derivationList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $derivationFactory) {
        var vm = this;

        vm.derivationList = null;
        vm.count = 0;
        vm.pagination = { page: 0, limit: 10 };

        /**
         * Carga de una nueva página en lista infinita
         */
        vm.nextPage = () => {
            return new Promise((resolve, reject) => {

                // Si el contador de elementos es igual a los cargados se retorna ahora
                if (vm.count && (vm.count <= vm.derivationList.length)) {
                    return async.setImmediate(reject);
                }
                vm.pagination.page++;
                // Llamada a factory para obtener lista
                let filter = angular.copy(vm.filter);
                filter.toEstablishment = _.map(filter.toEstablishment, 'id');
                filter.fromEstablishment = _.map(filter.fromEstablishment, 'id');
                $derivationFactory.getList(vm.finished, vm.pagination, filter).then(obj => {
                    vm.derivationList = _.concat(vm.derivationList || [], obj.list);
                    vm.count = obj.count;
                    resolve();
                }, () => {
                    reject();
                });
            });
        };

        /**
         * Escuchar cambios en filtros para actualizar lista
         */
        $scope.$watch('vm.filter', (filter) => {
            if (!_.isEmpty(filter)) {
                vm.derivationList = null;
                vm.count = 0;
                vm.pagination.page = 0;
                vm.nextPage().then(() => { }, () => { });
            }
        }, true);
    }
})();