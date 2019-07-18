(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-personal-data></ssvq-employee-personal-data>
     */
    app.directive('ssvqEmployeePersonalData', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: true,
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employee-personal-data/employee-personal-data.tmpl.html'
        };
    });

    /* @ngInject */
    function ComponentController(employeeFactory, $mdDialog, $mdToast) {
        var vm = this;
        vm.temp = _.pick(employee, ['name', 'lastname', 'mlastname', 'email', 'personalEmail', 'annexe']);
        vm.firstUpdate = () => {
            employeeFactory.firstUpdate(vm.temp).then((data) => {
                if (data.ok) {
                    _.merge(employee, vm.temp, { firstUpdate: true });
                    $mdDialog.hide();
                    $mdToast.showSimple('Bienvenido ' + vm.temp.name + ', tus datos fueron actualizados.');
                    console.log();
                } else {
                    $mdToast.showSimple('Oops, ha ocurrido un error.');
                    console.log(data.err);
                }
            });
        };
        vm.logout = () => {
            io.socket.post('/employee/logout', function (err, data) {
                if (data.body.ok) {
                    location.reload();
                }
            });
        };
    };
})();
