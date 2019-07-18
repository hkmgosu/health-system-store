(() => {
    'use strict';
    /**
      * Example
      * <ssvq-storage-account-details></ssvq-storage-account-details>
      */
    app.directive('ssvqStorageAccountDetails', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            templateUrl: '/components/storage/accountPlan/accountPlanDetails/accountDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $stateParams, $mdToast, accountFactory) {
        var vm = this;

        console.log('stateParams',$stateParams);

        let idAccount = $stateParams.id;
        if (!idAccount) { return; }
        vm.accountPlan = null;

        accountFactory.get(idAccount).then(
            accountPlan => {
                vm.accountPlan = accountPlan;
                $scope.$apply();
            },
            err => { 
                $mdToast.showSimple('La cuenta no existe');
                console.log(err);
                location.href = '#/bodega/cuenta-contable';
            }
        );


        vm.update = () => {
            accountFactory.update(vm.accountPlan).then(
                // exito
                data => {
                    vm.accountPlan = data;
                    $scope.$apply();
                    $mdToast.showSimple('Se ha guardado la información');
                },
                // fail
                () => $mdToast.showSimple('Hubo un problema al guardar')
            );
        };
    }
})();