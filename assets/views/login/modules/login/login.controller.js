(function () {
    'use strict';
    /**
     * Example
     * <ssvq-login></ssvq-login>
     */
    app.directive('ssvqLogin', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/views/login/modules/login/login.tmpl.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $state, triSettings, $location) {
        var vm = this;
        $scope.triSettings = triSettings;
        $scope.msg = '';
        $scope.user = {
            rut: '', // por defecto volver a dejar como vacio 
            password: '' // por defecto volver a dejar como vacio 
        };
        $scope.loading = false;

        $scope.loginClick = function () {
            var code = $location.search().code ? $location.search().code : undefined;
            $scope.loading = true;
            io.socket.post('/employee/login', {
                data: $scope.user,
                code: code
            }, function (data) {
                $scope.loading = false;
                if (data.ok) {
                    if ( !_.isEmpty(hashRef) && hashRef !== '#/') {
                        window.location.href = data.obj.url + '?rto' + hashRef;
                    } else {
                        window.location.href = data.obj.url;
                    }
                } else {
                    $scope.msg = data.msg;
                    $scope.$apply();
                }
            });
        };

        $scope.$watch('user', function (user, old) {
            $scope.msg = '';
        }, true);
    }
})();