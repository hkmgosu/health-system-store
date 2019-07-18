(function () {
    'use strict';
    /**
     * Example
     * <input ssvq-date-input ng-model="">
     */
    app.directive('ssvqDateInput', () => {
        return {
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            link: function (scope) {
                if (scope.ngModel) scope.ngModel = new Date(scope.ngModel);
            }
        };
    });
})();