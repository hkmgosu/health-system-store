(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-list finished="" filter=""></ssvq-request-list>
     */
    app.directive('ssvqRequestList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                finished: '=',
                filter: '=',
                count: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestList/requestList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, requestFactory, $timeout) {
        var vm = this;
        vm.requests = null;
        vm.count = 0;
        vm.pagination = { page: 0, limit: 15 };
        let getRequests;
        /**
         * Carga de una nueva página en lista infinita
         */
        vm.nextPage = () => {
            return new Promise((resolve, reject) => {
                vm.pagination.page++;
                // Llamada a factory para obtener lista
                getRequests({
                    filter: _.extend({}, vm.filter, { finished: vm.finished }),
                    page: vm.pagination.page
                }).then(requests => {
                    vm.requests = _.concat(vm.requests || [], requests);
                    resolve();
                }, function (err) {
                    reject();
                });
            });
        };

        /**
         * Escuchar cambios en filtros para actualizar lista
         */
        var timeoutPromise;
        $scope.$watch('vm.filter', filter => {
            if (_.isEmpty(filter)) { return; }
            $timeout.cancel(timeoutPromise);
            timeoutPromise = $timeout(function () {
                vm.requests = null;
                vm.count = 0;
                vm.pagination.page = 0;
                getRequests = filter.mode === 'subscribed' ? requestFactory.getSubscribed : requestFactory.getSupervised;
                vm.nextPage().then(() => { }, () => { });
            }, 600);
        }, true);
    }
})();