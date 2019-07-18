(function () {
    'use strict';

    /**
     * md-autocomplete-required
     */

    app.directive('mdAutocompleteRequired', function ($timeout) {
        return {
            restrict: 'A',
            require: '^form',
            link: function (scope, element, attr, ctrl) {
                if (attr.mdAutocompleteRequired == 'true') {
                    $timeout(function () {
                        var realModel,
                            elemCtrl = ctrl[attr.mdInputName],
                            realValidation = function (model) {
                                elemCtrl.$setValidity('selectedItem', !!realModel);
                                return model;
                            };
                        if (!!attr.mdSelectedItem && !!attr.mdInputName) {
                            scope.$watchCollection(attr.mdSelectedItem, function (obj) {
                                realModel = obj;
                                realValidation()
                            });
                            elemCtrl.$parsers.push(realValidation);
                        }
                    })
                }
            }
        }
    });
})();