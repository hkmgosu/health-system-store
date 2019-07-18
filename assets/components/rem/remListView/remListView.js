(function () {
    'use strict';
    /**
     * <ssvq-rem-list-view></ssvq-rem-list-view>
     */
    app.directive('ssvqRemListView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remListView/remListView.html'
        };
    });

    /* @ngInject */
    function ComponentController(remFactory, $mdToast, $translate, $mdSidenav, $mdDialog, workshiftFactory) {
        var vm = this;

        vm.selectedTab = 0;

        vm.newRem = ($event) => {
            $mdDialog.show({
                targetEvent: $event || null,
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: '/components/rem/remListView/dialog.newRem.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.save = rem => $mdDialog.hide(rem);
                },
                controllerAs: 'vm',
                locals: {}
            }).then(rem => {
                if (rem) {
                    remFactory.save(_.extend(rem, { status: 1, region: 6 })).then(
                        newRem => window.location.href = '#/samu/incidentes/' + newRem.obj.id,
                        err => $mdToast.showSimple($translate.instant(err.msg))
                    );
                }
            });
        };

        vm.createRejectedRem = $event => {
            $mdDialog.show({
                targetEvent: $event || null,
                clickOutsideToClose: true,
                templateUrl: '/components/rem/remListView/dialog.newRejectedRem.html',
                /* @ngInject */
                controller: function ($mdDialog, remFactory) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.save = opts => $mdDialog.hide(opts);
                    vm.reasons = remFactory.getRejectedReason();
                },
                controllerAs: 'vm',
                locals: {}
            }).then(opts => {
                remFactory.saveRejected(opts || {}).then(
                    () => $mdToast.showSimple('Llamada ingresada exitosamente'),
                    err => $mdToast.showSimple('Hubo un error ingresando llamada rechazada')
                );
            });
        };

        vm.updateList = () => {
            vm.filter.updatedAt = new Date();
            $mdToast.showSimple('Actualizando lista de incidentes');
        };

        vm.toggleFilter = () => {
            $mdSidenav('rem-filter').toggle();
        };

        if (employee.samuFullAccess) {
            vm.hasActiveWorkshift = true;
        } else {
            workshiftFactory.getCurrentWorkshift().then(idWorkshift => {
                vm.idWorkshift = idWorkshift;
                vm.hasActiveWorkshift = true;
            }, () => vm.hasActiveWorkshift = false);
        }

    }
})();