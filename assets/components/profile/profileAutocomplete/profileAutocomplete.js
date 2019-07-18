(() => {
    'use strict';
    /**
      * Example
      * <ssvq-profile-autocomplete></ssvq-profile-autocomplete>
      */
    app.directive('ssvqProfileAutocomplete', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                onSelect: '&?',
                opts: '='
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/profile/profileAutocomplete/profileAutocomplete.html'
        };
    });

    /* @ngInject */
    function ComponentController(profileFactory) {
        var vm = this;

        vm.opts = _.defaults(vm.opts || {}, {
            clearOnSelect: true,
            minLength: 0
        });

        vm.getMatches = profileFactory.getList;

        vm.onLocalSelect = selected => {
            if (!selected) { return; }
            if (vm.onSelect) { vm.onSelect()(selected); }
            if (vm.opts.clearOnSelect) {
                vm.searchText = '';
                vm.selected = undefined;
            }
        };

    }
})();