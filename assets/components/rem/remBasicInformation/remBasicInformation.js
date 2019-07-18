(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-basic-information></ssvq-rem-basic-information>
     */
    app.directive('ssvqRemBasicInformation', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                basicInformation: '=data',
                mode: '@?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remBasicInformation/remBasicInformation.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $translate, remFactory, utilitiesFactory) {
        var vm = this;

        vm.saving = false;

        vm.save = (data) => {
            vm.saving = true;
            remFactory
                .save(data, { log: 'basicInformationChanged' })
                .then((response) => {
                    if (response.ok) {
                        $mdToast.showSimple('Datos básicos actualizados');
                        vm.basicDataForm.$setPristine();
                        vm.basicDataForm.$setUntouched();
                    } else {
                        $mdToast.showSimple('Ha ocurrido un error: ' + response.msg);
                    }
                    vm.saving = false;
                }, (err) => {
                    $mdToast.showSimple('Ha ocurrido un error: ' + err);
                });
        };

        remFactory.getCallReasons()
            .then(
                (res) => vm.callReasons = res,
                (err) => console.error('remFactory.getCallReasons', err)
            );
        remFactory.getApplicantTypes()
            .then(
                (res) => vm.applicantTypes = res,
                (err) => console.error('remFactory.getCallReasons', err)
            );

        vm.onCallReasonChange = callReason => {
            if (callReason) {
                remFactory.getSubCallReasons(callReason).then(
                    res => vm.subCallReasons = res,
                    err => console.error('remFactory.getSubCallReasons', err)
                );
            }
        };

        $scope.$watch(
            'vm.basicInformation.callReason',
            vm.onCallReasonChange
        );
        vm.priorities = utilitiesFactory.getPriority();
    }
})();