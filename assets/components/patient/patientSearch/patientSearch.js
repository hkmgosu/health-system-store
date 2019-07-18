(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-search></ssvq-patient-search>
     */
    app.directive('ssvqPatientSearch', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                type: '@?',
                label: '@?'
            },
            restrict: 'E',
            scope: {
                selected: "=",
                onSelect: "&",
                clearOnSelect: "=",
                minLength: '=?'
            },
            templateUrl: (elem, attr) => {
                return '/components/patient/patientSearch/patientSearch' + (attr.type === 'input' ? 'Input' : '') + '.html';
            }
        };
    });

    /* @ngInject */
    function ComponentController($scope, patientFactory) {
        var vm = this;
        vm.label = vm.label || 'Buscar paciente';
        angular.merge($scope, {
            /* Variables */
            searching: false,
            resultCount: -1,
            minLength: _.isUndefined($scope.minLength) ? 3 : $scope.minLength,
            searchText: '',
            fields: {
                fullname: true,
                rut: true,
                age: true
            },
            /* Métodos*/
            getMatches: searchText => new Promise((resolve, reject) => {
                patientFactory.getList({
                    filter: searchText
                }).then(resolve, reject);
            }),
            myOnSelect: function (selected) {
                if (selected) {
                    $scope.onSelect()(selected);
                    if ($scope.clearOnSelect) {
                        $scope.searchText = null;
                    }
                }
            }
        });
    }
})();