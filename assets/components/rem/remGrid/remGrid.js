(function () {
    'use strict';
    /**
     * example
     * <ssvq-rem-grid></ssvq-rem-grid>
     */
    app.directive('ssvqRemGrid', () => {
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
            templateUrl: '/components/rem/remGrid/remGrid.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $location, remFactory, $mdDialog, $mdToast) {
        var vm = this;

        vm.remList = null;
        vm.count = 0;
        vm.pagination = { page: 0, limit: 12 };

        vm.viewDetails = function (id) {
            $location.path('/samu/incidentes/' + id);
        };

        vm.getVehiclesLabel = vehicles => !_.isEmpty(vehicles) ? _.map(vehicles, 'name').join(', ') : 'Sin vehículos';

        vm.getPatientAge = patient => {
            if (patient.birthdate) {
                return moment().diff(patient.birthdate, 'years', false) + ' años';
            } else if (patient.estimatedYears) {
                return patient.estimatedYears + ' años';
            }
        };

        /**
         * Carga de una nueva página en lista infinita
         */
        vm.nextPage = () => {
            return new Promise((resolve, reject) => {
                // Si el contador de elementos es igual a los cargados se retorna ahora
                if (vm.count && (vm.count <= vm.remList.length)) {
                    return async.setImmediate(reject);
                }
                vm.pagination.page++;
                // Llamada a factory para obtener lista
                let filter = angular.copy(vm.filter);
                filter.commune = filter.commune ? filter.commune.id : null;
                filter.createdBy = filter.createdBy ? filter.createdBy.id : null;
                remFactory.getDynamic({
                    filter: _.extend({}, filter, { finished: vm.finished }),
                    page: vm.pagination.page
                }).then(data => {
                    vm.remList = _.concat(vm.remList || [], data.rems);
                    vm.count = data.count;
                    resolve();
                }, function (err) {
                    vm.remList = vm.remList || [];
                    reject();
                });
            });
        };

        /**
         * Escuchar cambios en filtros para actualizar lista
         */
        $scope.$watch('vm.filter', (filter) => {
            if (!_.isEmpty(filter)) {
                vm.remList = null;
                vm.count = 0;
                vm.pagination.page = 0;
                vm.nextPage().then(() => { }, () => { });
            }
        }, true);
    }
})();