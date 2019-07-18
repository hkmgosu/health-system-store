(() => {
    'use strict';
    /**
     * Example
     * <ssvq-event-type-autocomplete></ssvq-event-type-autocomplete>
     */
    app.directive('ssvqEventTypeAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                label: '@?',
                selected: "=",
                onSelect: "&",
                clearOnSelect: "=",
                minLength: '=?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventListFilter/eventTypeAutocomplete/eventTypeAutocomplete.html'
        };
    });

    /* @ngInject */
    function ComponentController(adverseEventFactory) {
        var vm = this;
        vm.label = vm.label || 'Buscar tipo de evento';

        vm.getMatches = (searchText) => {
            return adverseEventFactory.getEventType({ filter: searchText })
                .then((response) => {
                    if (response.ok) {
                        return response.obj.eventTypes;
                    } else {
                        return [];
                    }
                }, (err) => {
                    console.log(err);
                    return [];
                });
        };

        vm.myOnSelect = selected => {
            if (selected) {
                vm.selected = selected;
                vm.onSelect()(selected);
                if (vm.clearOnSelect) {
                    vm.tempSelected = null;
                    vm.searchText = null;
                }
            }
        }
    }
})();