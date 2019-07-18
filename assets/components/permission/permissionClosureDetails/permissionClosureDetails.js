(() => {
    'use strict';
    /**
     * Example
     * <ssvq-permission-closure-details></ssvq-permission-closure-details>
     */
     app.directive('ssvqPermissionClosureDetails', () => {
         return {
             controller      : ComponentController,
             controllerAs    : 'vm',
             bindToController: {},
             restrict        : 'E',
             scope: {},
             templateUrl: '/components/permission/permissionClosureDetails/permissionClosureDetails.html'
         };
     });

    /* @ngInject */
    function ComponentController($mdDialog, $mdToast, $timeout, $stateParams, $permissionClosureFactory) {
        var vm = this;
        vm.closure = {};
        vm.goBack = () => window.history.back();

        vm.export = function () {
            $timeout(function () {
                window.print();
            });
        };

        vm.onChange = num => {
            vm.closure.permissions = vm.closure.permissions.map(permission => {
                permission.correlativeNumber = num++;
                return permission;
            });
        };

        vm.onConfirm = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: 'Confirmación de cierre',
                    textContent: '¿Deseas confirmar el cierre?',
                    ok: 'Confirmar',
                    cancel: 'Volver'
                })
            ).then(() => {
                $mdToast.showSimple('Confirmando cierre...');
                let closure = angular.copy(vm.closure);
                closure.permissions = closure.permissions.map(permission => _.pick(permission, ['id', 'correlativeNumber']));
                $permissionClosureFactory.confirm(closure).then(() => {
                    vm.closure.confirmed = true;
                    vm.closure.correlativeStart = vm.closure.permissions[0].correlativeNumber;
                    vm.closure.correlativeEnd = vm.closure.permissions[vm.closure.permissions.length - 1].correlativeNumber;
                    $mdToast.showSimple('Se ha confirmado el cierre');
                }, () => $mdToast.showSimple('Ha ocurrido un error'));
            });
        };

        $permissionClosureFactory
            .getClosureDetails($stateParams.id)
            .then(closure => vm.closure = closure)
            .catch(err => console.log(err));
    }
})();