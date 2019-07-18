(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-list-filter filter=""></ssvq-rem-list-filter>
     */
    app.directive('ssvqRemListFilter', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                filter: '=',
                selectedTab: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remListFilter/remListFilter.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, remFactory, communeFactory, localStorageService, $mdDialog) {
        var vm = this;
        let defaultFilter = {
            searchText: '',
            createdBy: null,
            commune: null,
            status: []
        };
        vm.filterOpened = '';
        vm.filter = _.extend({}, defaultFilter, localStorageService.get('remFilter'));
        //Limpiar filtros
        vm.cleanFilters = () => {
            vm.remStatus.forEach(remStatus => remStatus.checked = false);
            vm.filter = angular.copy(defaultFilter);
        };
        remFactory.getRemStatus().then(
            remStatus => {
                remStatus.forEach(status => {
                    status.checked = vm.filter.status.indexOf(status.id) !== -1;
                });
                vm.remStatus = remStatus;
            },
            err => console.error('remFactory.getRemStatus', err)
        );

        vm.getCommunes = communeFactory.getAutocomplete;

        vm.cleanFilterOpened = () => {
            vm.filterOpened = '';
        };

        $scope.$watch('vm.filter', filter => {
            if (filter) {
                localStorageService.set('remFilter', filter);
            }
        }, true);
        $scope.$watch('vm.remStatus', remStatus => {
            if (remStatus) {
                vm.filter.status = _.map(_.filter(remStatus, { checked: true }), 'id') || [];
            }
        }, true);

        // Mostrar filtro de fecha creación
        vm.showCreatedAtFilter = ($event) => {
            let applyFilter = filter => {
                _.extend(vm.filter, filter);
            };
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/rem/remListFilter/dialog.createdAt.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, applyFilter) {
                        var vm = this;
                        vm.applyFilter = function () {
                            applyFilter(vm.filter);
                            $mdDialog.hide();
                        };
                        vm.cancel = function () {
                            $mdDialog.hide();
                        };
                    },
                controllerAs: 'vm',
                locals: {
                    applyFilter: applyFilter
                }
            });
        };
    }
})();