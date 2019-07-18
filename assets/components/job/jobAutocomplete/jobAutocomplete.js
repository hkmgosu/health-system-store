(function () {
    'use strict';
    /**
     * Example
     * <ssvq-job-autocomplete selected="" required=""></ssvq-job-autocomplete>
     */
    app.directive('ssvqJobAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                selected: "=",
                onSelect: '&?',
                type: '@?', // search | input
                clearOnSelect: "=",
                required: "="
            },
            restrict: 'E',
            scope: {},
            templateUrl: (elem, attr) => {
                return '/components/job/jobAutocomplete/jobAutocomplete' + (attr.type === 'search' ? 'Search' : 'Input') + '.html';
            }
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
        vm.getMatches = searchText => new Promise((resolve, reject) => {
            io.socket.post('/job/get', { filter: searchText }, data => {
                data.ok ? resolve(data.obj.jobs) : reject();
            });
        });

        vm.localOnSelect = selected => {
            if (selected) {
                if (vm.onSelect) {
                    vm.onSelect()(selected);
                }
                if (vm.clearOnSelect) {
                    vm.searchText = '';
                    vm.selected = undefined;
                }
            }
        };

    }
})();
