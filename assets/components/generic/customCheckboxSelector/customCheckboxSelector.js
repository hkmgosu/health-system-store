(() => {
    'use strict';
    /**
     * Example
     * <ssvq-custom-checkbox-selector></ssvq-custom-checkbox-selector>
     */
    app.directive('ssvqCustomCheckboxSelector', () => {
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
            templateUrl: '/components/generic/customCheckboxSelector/customCheckboxSelector.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, adverseEventFactory) {
        this.name = this.label.toLocaleLowerCase().normalize('NFKD').replace(/[\?\¿\s\u0300-\u036F]/g, '');
        this.otherOption = this.otherOption === 'true';
        this.other = { name: undefined, other: true };
        this.observations = [];
        this.tempModel = [];

        if (_.some(this.parametrics, { hasObservation: true })) {
            _.map(this.parametrics, item => {
                if (item.hasObservation) {
                    this.observations[item.id] = { id: item.id, value: undefined, hasObservation: true };
                }
            })
        }

        if (this.model && (this.model || []).length > 0) {
            this.model = _.map(this.model, data => {
                let tempData;
                if (data.hasObservation) {
                    tempData = data.id;
                    this.observations[data.id].value = data.value;
                    data = this.observations[data.id];
                } else if (data.fixedField) {
                    tempData = data.id;
                } else {
                    data.item = angular.copy(data);
                    data.other = true;
                    data = _.pick(data, ['name', 'other', 'item']);
                    this.other = data;
                    tempData = undefined;
                }
                this.tempModel.push(tempData);
                return data;
            });
        } else {
            this.model = undefined;
        }

        this.exists = (selected, model) => {
            return model.indexOf(selected) > -1;
        };

        this.toggle = (selected, model) => {
            !this.model ? this.model = [] : null;
            var idx = model.indexOf(selected.id);
            if (idx > -1) {
                model.splice(idx, 1);
                if (selected.other) {
                    _.remove(this.model, { other: true });
                    this.other.name = this.other.item = undefined;
                } else if (selected.hasObservation) {
                    _.remove(this.model, { id: selected.id });
                } else {
                    this.model.splice(idx, 1);
                }
            } else {
                model.push(selected.id);
                if (selected.other) {
                    this.model.push(this.other);
                } else if (selected.hasObservation) {
                    this.model.push(this.observations[selected.id]);
                } else {
                    this.model.push(selected.id);
                }
            }
            (this.model || []).length === 0 ? this.model = undefined : null;
        };

        this.getMatches = () => {
            return this.autocompleteFunction()(this.other.name, this.nameParametric);
        };
    }
})();