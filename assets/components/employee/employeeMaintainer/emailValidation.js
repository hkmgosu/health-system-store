
app.directive("unique", function (employeeFactory) {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            init: '@'
        },
        link: function ($scope, $elem, $attr, ngModel) {

            var initValue;

            $attr.$observe('init', function (value) {
                initValue = value;
            });
            ;
            ngModel.$asyncValidators.unique = function (modelValue) {
                if (!modelValue || !initValue || (initValue && modelValue.toLowerCase() == initValue.toLowerCase())) {
                    return new Promise(function (resolve, reject) {
                        resolve(true);
                    })
                }
                return employeeFactory.validateEmail(modelValue);
            }
        }
    };
});