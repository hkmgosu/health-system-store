(() => {
    'use strict';
    /**
     * Example
     * <ssvq-custom-option-selector></ssvq-custom-option-selector>
     */
    app.directive('ssvqCustomOptionSelector', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                model: '=',
                label: '@',
                parametrics: '=',
                nameParametric: '@',
                otherOption: '@',
                autocompleteFunction: '&?',
                requiredOption: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/generic/customOptionSelector/customOptionSelector.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, adverseEventFactory) {
        this.name = this.label.toLocaleLowerCase().normalize('NFKD').replace(/[\?\¿\s\u0300-\u036F]/g, '');
        this.otherOption = this.otherOption === 'true';

        this.select = (item) => {
            if (item.other) {
                this.model = item;
            } else if (item.id || item.id === false) {
                this.model = item.id;
            } else {
                this.model = item;
            }
        };

        this.getMatches = () => {
            return this.autocompleteFunction()(this.model.name, this.nameParametric);
        };

        if (this.model) {
            if (this.model.fixedField === false) {
                this.model.other = true;
            }
            this.select(this.model);
        }
    }
})();