(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-presentation-type-actions></ssvq-storage-presentation-type-actions>
     */
    app.directive('ssvqStoragePresentationTypeActions', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                item: '=',
                hiddenEdit: '@',
                hiddenDelete: '@',
                afterEdit: '&?',
                afterDelete: '&?'
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/presentationType/presentationTypeActions/presentationTypeActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, presentationTypeFactory) {
        var vm = this;
        vm.onEditItem = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/presentationType/presentationTypeActions/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.presentationType = angular.copy(vmParent.item);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.presentationType);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando tipo de presentación...');

                presentationTypeFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha actualizado el tipo');
                        vmParent.item = dataReturn.obj.presentationType;
                        vm.afterEdit && vm.afterEdit(dataReturn);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo modificar el tipo')
                );
            });
        };

        vm.onDeleteItem = () => {
            let message = $translate.instant('PRESENTATION_TYPE.DIALOG.DELETE_MESSAGE') +
                ' ' + vm.item.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('PRESENTATION_TYPE.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('PRESENTATION_TYPE.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('PRESENTATION_TYPE.DIALOG.TITLE'))
                .cancel($translate.instant('PRESENTATION_TYPE.DIALOG.CANCEL'))
            ).then(
                function() {
                    presentationTypeFactory.delete(vm.item.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado el tipo ' +
                                response.obj.presentationType.description);
                            vm.afterDelete && vm.afterDelete()(response);
                        },
                        // fail
                        err => {
                            $mdToast.showSimple('Hubo un problema al eliminar');
                            console.log(err);
                        }
                    );
                },
                function() {
                    console.log(vm, $scope);
                } // cancelo
            );
        };
    }
})();