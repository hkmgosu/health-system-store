(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-autocomplete></ssvq-employee-autocomplete>
     */
    app.directive('ssvqEmployeeAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                type: '@?',
                label: '@?',
                selected: "=",
                onSelect: "&?",
                onShowEstablishment: '&',
                onSendEmail: '&',
                clearOnSelect: "=",
                public: "=",
                unitRoot: '=?',
                minLength: '=?',
                opts: '=?',
                disabledOption: '=?'
            },
            scope: {},
            restrict: 'E',
            templateUrl: (elem, attr) => {
                return '/components/employee/employeeAutocomplete/employeeAutocomplete' + (attr.type === 'search' ? 'Search' : 'Input') + '.html';
            }
        };
    });

    /* @ngInject */
    function ComponentController(employeeFactory) {
        var vm = this;
        vm.label = vm.label || 'Buscar personas';
        angular.merge(vm, {
            /* Variables */
            searching: false,
            resultCount: -1,
            minLength: _.isUndefined(vm.minLength) ? 3 : vm.minLength,
            searchText: '',
            fields: {
                fullname: true,
                job: true,
                establishment: true,
                contact: true
            },
            /* Métodos*/
            getMatches: searchText => new Promise((resolve, reject) => {
                let getList = (vm.public) ? employeeFactory.getListPublic : employeeFactory.getList;
                getList({
                    filter: searchText,
                    opts: {
                        unitRootHierarchy: vm.unitRoot ? vm.unitRoot.hierarchy : null
                    }
                }).then(resolve, reject);
            }),
            myOnSelect: function (selected) {
                if (selected) {
                    if (vm.onSelect) {
                        vm.onSelect()(selected);
                    }
                    if (vm.clearOnSelect) {
                        vm.searchText = '';
                        vm.selected = undefined;
                    }
                }
            }
        });
    }
})();