(() => {
    'use strict';
    /**
      * Example
      * <ssvq-profile-actions></ssvq-profile-actions>
      */
    app.directive('ssvqProfileActions', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idProfile: '=',
                onDelete: '&?',
                onCopy: '&'
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/profile/profileActions/profileActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $mdToast, profileFactory) {
        var vm = this;
        vm.showDeleteDialog = profile => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: '¿Estás seguro de eliminar el perfil seleccionado?',
                    textContent: 'El perfil será eliminada permanentemente',
                    ok: 'Eliminar perfil',
                    cancel: 'Cancelar'
                })
            ).then(() => {
                profileFactory.delete(vm.idProfile).then(() => {
                    $mdToast.showSimple('El perfil ha sido eliminado');
                    if (vm.onDelete) { vm.onDelete()(vm.idProfile); }
                }, err => {
                    $mdToast.showSimple('Ha ocurrido un error eliminando el perfil');
                });
            });
        };
    }
})();