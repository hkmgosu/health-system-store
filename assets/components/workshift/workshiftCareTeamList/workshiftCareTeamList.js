(() => {
    'use strict';
    /**
      * Example
      * <ssvq-workshift-care-team-list></ssvq-workshift-care-team-list>
      */
    app.directive('ssvqWorkshiftCareTeamList', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                careTeamList: '=',
                opts: '='
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/workshift/workshiftCareTeamList/workshiftCareTeamList.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $mdToast, workshiftFactory) {
        var vm = this;
        vm.editCareTeam = ($event, careTeam) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/workshift/workshiftCareTeamList/dialog.editCareTeam.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide();
                    vm.filter = {
                        careTeam: vm.careTeam.id,
                        workshift: vm.careTeam.workshift
                    };
                    vm.participantListOpts = {
                        realTimeUpdate: true,
                        showJobSelector: true
                    };
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { careTeam: careTeam }
            });
        };

        vm.removeCareTeam = (careTeam) => {
            if (!_.isEmpty(careTeam.participantList)) {
                return $mdToast.showSimple('No se puede eliminar vehículo con participantes');
            }

            $mdDialog.show(
                $mdDialog.confirm()
                    .title('Confirmación de eliminación')
                    .textContent('¿Estás seguro de eliminar el vehículo del turno?')
                    .ok('Quitar vehículo')
                    .ariaLabel('Quitar vehículo')
                    .cancel('Volver')
            ).then(() => {
                workshiftFactory.removeCareTeam(careTeam.id).then(() => {
                    _.remove(vm.careTeamList, { id: careTeam.id });
                    $mdToast.showSimple('Vehículo eliminado del turno');
                }, err => $mdToast.showSimple('Ha ocurrido un error eliminando el vehículo del turno'));
            });
        };
    }
})();