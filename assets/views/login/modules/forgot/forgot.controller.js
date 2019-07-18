(function () {
    'use strict';

    app.controller('ForgotController', ForgotController);

    /* @ngInject */
    function ForgotController($scope) {
        var vm = this;
        vm.sending = false;
        vm.sent = false;
        vm.rut = '';
        vm.resetClick = () => {
            if (!vm.rut) { return; }
            vm.sending = true;
            io.socket.post('/recoveryLink/create', { rut: vm.rut }, data => {
                vm.sending = false;
                vm.sent = true;
                vm.recoveryStatus = data.ok;
                if (data.ok) { vm.mail = data.obj.mail; }
                $scope.$apply();
            });
        };
    }
})();
