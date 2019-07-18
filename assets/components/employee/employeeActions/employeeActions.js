(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-actions></ssvq-employee-actions>
     */
    app.directive('ssvqEmployeeActions', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                employee: '=',
                onDelete: '&?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employeeActions/employeeActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $translate, $mdToast, employeeFactory) {
        var vm = this;

        /**
         * Mostrar y gestionar unidades supervisadas por el funcionario
         */
        vm.showSupervisedUnitList = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/employee/employeeMaintainer/dialog.supervisor.tmpl.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.close = () => $mdDialog.cancel();
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { employee: vm.employee }
            });
        };

        /**
         * Restaurar la cuenta de un funcionario
         */
        vm.restoreAccount = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: 'Restaurar cuenta',
                    htmlContent:
                        '<span>¿Estás seguro de restaurar la cuenta de <strong>' + vm.employee.fullname + '</strong>?</span>' +
                        '<p class="md-body-1">La contraseña será restaurada con los 4 primeros dígitos del rut</p>',
                    ok: 'Restaurar cuenta',
                    cancel: 'Volver'
                })
            ).then(() => {
                employeeFactory.setPassword(vm.employee.id).then(
                    () => $mdToast.showSimple('La cuenta fue restaurada'),
                    () => $mdToast.showSimple('La cuenta no pudo ser restaurada')
                );
            });
        };

        /**
         * Eliminar funcionario
         */
        vm.deleteItem = () => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title($translate.instant('EMPLOYEE.DELETE.TITLE'))
                    .textContent($translate.instant('EMPLOYEE.DELETE.TEXTCONTENT'))
                    .ok($translate.instant('EMPLOYEE.DELETE.OK'))
                    .ariaLabel($translate.instant('EMPLOYEE.DELETE.TITLE'))
                    .cancel($translate.instant('EMPLOYEE.DELETE.CANCEL'))
            ).then(() => {
                $mdToast.showSimple($translate.instant('EMPLOYEE.OTHERS.DELETING'));
                employeeFactory.delete(vm.employee.id).then(
                    () => {
                        $mdToast.showSimple('El funcionario ha sido eliminado');
                        if (vm.onDelete) { vm.onDelete()(vm.employee.id); }
                    },
                    () => { $mdToast.showSimple('El funcionario no pudo ser eliminado'); }
                );
            });
        };
    }
})();