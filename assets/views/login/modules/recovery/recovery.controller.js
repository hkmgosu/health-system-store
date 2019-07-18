(function () {
    'use strict';

    app.controller('RecoveryController', RecoveryController);

    /* @ngInject */
    function RecoveryController($scope, $state, $mdToast) {
        $scope.isValid = false;
        $scope.msg = '';
        $scope.user = {
            password: ''
        };

        var showToast = function (msg) {
            $mdToast.show({ template: '<md-toast> <p translate>' + msg + '</p> </md-toast>' });
        };

        io.socket.post('/recoveryLink/validate', {
            key: $state.params.key || ''
        }, function (data) {
            if (data.ok) {
                $scope.isValid = true;
            } else {
                $scope.isValid = false;
            }
            $scope.$apply();
        });

        $scope.setPassword = function () {
            if (!$state.params.key) return;
            io.socket.post('/recoveryLink/use', {
                key: $state.params.key || '',
                pass: $scope.user.password
            }, function (data) {
                if (data.ok) {
                    showToast(data.msg);
                    setTimeout(function () {
                        $state.go('authentication.login');
                    }, 4000);
                } else {
                    $scope.msg = data.msg;
                }
            })
        };
        $scope.toLogin = function () {
            $state.go('authentication.login');
        };
    }

    RecoveryController.$inject = ['$scope', '$state', '$mdToast'];
})();