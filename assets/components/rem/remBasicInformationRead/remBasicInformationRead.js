(() => {
    'use strict';
    /**
      * Example
      * <ssvq-rem-basic-information-read></ssvq-rem-basic-information-read>
      */
    app.directive('ssvqRemBasicInformationRead', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { data: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/rem/remBasicInformationRead/remBasicInformationRead.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, remFactory, $mdToast, $scope, screenSize) {
        var vm = this;

        $scope.desktop = screenSize.on('md, lg', function (match) {
            $scope.desktop = match;
        });
        $scope.mobile = screenSize.on('xs, sm', function (match) {
            $scope.mobile = match;
        });

        var mapFormData = data => {
            return {
                id: data.id,
                callReason: data.callReason ? data.callReason.id : null,
                subCallReason: data.subCallReason ? data.subCallReason.id : null,
                applicantName: data.applicantName,
                applicantPhone: data.applicantPhone,
                applicantType: data.applicantType ? data.applicantType.id : null,
                priority: data.priority,
                description: data.description
            };
        };

        $scope.$watch('vm.data', data => {
            if (_.isEmpty(data)) { return; }
            vm.formData = mapFormData(data);
        }, true);

        vm.edit = ($event) => {
            $mdDialog.show({
                targetEvent: $event || null,
                templateUrl: '/components/rem/remBasicInformationRead/dialog.edit.html',
                /* @ngInject */
                controller: function ($scope, $mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.data);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    data: vm.formData
                }
            }).then(dataUpdated => {
                remFactory.save(dataUpdated, { log: 'basicInformationChanged' }).then((response) => {
                    if (response.ok) {
                        $mdToast.showSimple('Datos básicos actualizados correctamente');
                    } else {
                        $mdToast.showSimple('Ha ocurrido un error: ' + response.msg);
                    }
                }, (err) => {
                    $mdToast.showSimple('Ha ocurrido un error: ' + err);
                });
            });
        };
    }
})();