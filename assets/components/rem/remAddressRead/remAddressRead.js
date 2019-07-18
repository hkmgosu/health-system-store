(() => {
    'use strict';
    /**
      * Example
      * <ssvq-rem-address-read></ssvq-rem-address-read>
      */
    app.directive('ssvqRemAddressRead', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { data: '=', idRem: '@' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/rem/remAddressRead/remAddressRead.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, remFactory, $mdToast, screenSize) {
        var vm = this;

        $scope.desktop = screenSize.on('md, lg', function (match) {
            $scope.desktop = match;
        });
        $scope.mobile = screenSize.on('xs, sm', function (match) {
            $scope.mobile = match;
        });

        vm.addressFormOptions = {
            showConfirmButton: true,
            required: true
        };

        vm.edit = ($event) => {
            $mdDialog.show({
                targetEvent: $event || null,
                templateUrl: '/components/rem/remAddressRead/dialog.editData.html',
                /* @ngInject */
                controller: function ($scope, $mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.address);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    address: mapFormAddress(vm.data)
                }
            }).then(addressUpdated => {
                vm.saveAddress(addressUpdated);
            });
        };

        var mapFormAddress = address => {
            return {
                state: address.state ? address.state.id : null,
                district: address.district ? address.district.id : null,
                zone: address.zone,
                text: address.text,
                reference: address.reference,
                position: address.position
            };
        };

        $scope.$watch('vm.data', address => {
            if (_.isEmpty(address)) { return; }
            vm.addressFormData = mapFormAddress(address);
        }, true);


        vm.saveAddress = address => new Promise((resolve, reject) => {
            remFactory.save({
                id: vm.idRem,
                originAddress: address
            }, { log: 'addressInformationChanged' }).then((response) => {
                if (response.ok) {
                    $mdToast.showSimple('Ubicación actualizada');
                    resolve();
                } else {
                    $mdToast.showSimple('Ha ocurrido un error: ' + response.msg);
                    reject();
                }
            }, (err) => {
                $mdToast.showSimple('Ha ocurrido un error: ' + err);
                reject();
            });
        });
    }
})();