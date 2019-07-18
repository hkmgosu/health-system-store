(function () {
    'use strict';

    app.controller('RequiredPrivilegeController', RequiredPrivilegeController);

    /* @ngInject */
    function RequiredPrivilegeController($scope, $element, $attrs, $state) {
        var can = $state.current.data.privileges;
        var privileges = $scope.$eval($attrs.requiredPrivilege);
        var verify = function (val) {
            if (!can[val]) {
                $element.remove();
            } else {
                //console.log("tiene permiso para :" + val);
            }
        };
        if (_.isArray(privileges)) {
            _.each(privileges, verify);
        } else if (_.isString(privileges)) {
            verify(privileges);
        }

    }

    app.directive('requiredPrivilege', function () {
        return {
            controller: 'RequiredPrivilegeController',
            restrict: 'A'
        };
    });

})();