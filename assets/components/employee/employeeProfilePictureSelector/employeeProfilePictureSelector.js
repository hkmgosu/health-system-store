(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-profile-picture-selector employee="{}" own="true|false"></ssvq-employee-profile-picture-selector>
     */
    app.directive('ssvqEmployeeProfilePictureSelector', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                employee: '=',
                own: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employeeProfilePictureSelector/employeeProfilePictureSelector.html'
        };
    });

    /* @ngInject */
    function ComponentController(Upload, employeeFactory, $mdDialog, $mdToast) {
        var vm = this;
        vm.timestamp = moment().format('X');

        vm.selectFile = ($file) => {
            if (!$file) { return; }

            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/employee/employeeProfilePictureSelector/dialog.cropImage.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.close = () => $mdDialog.cancel();
                        Upload.base64DataUrl(vm.file, false).then(url => {
                            Upload.imageDimensions(vm.file).then(dimensions => {
                                vm.pictureWidth = window.innerWidth - 400;
                                vm.pictureHeight = window.innerHeight - 400;
                                vm.profileImage = url;
                            });
                        });
                        vm.confirm = () => $mdDialog.hide(vm.croppedDataUrl);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: { file: $file }
            }).then(pictureUrl => {
                vm.processing = true;
                Upload.upload({
                    url: vm.own ? '/employee/uploadMyProfilePicture' : '/employee/uploadProfilePicture',
                    data: {
                        file: Upload.dataUrltoBlob(pictureUrl),
                        idEmployee: vm.employee.id
                    }
                }).then(() => {
                    $mdToast.showSimple('La imagen de perfil ha sido actualizada');
                    vm.timestamp = moment().format('X');
                    vm.processing = false;
                }, reason => {
                    $mdToast.showSimple('La imagen de perfil no ha podido ser actualizada');
                    vm.processing = false;
                    console.log(reason);
                }, evt => {
                    vm.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                });
            });
        };

        vm.deleteProfilePicture = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: 'Eliminación de imagen de perfil',
                    textContent: '¿Seguro que deseas eliminar la imagen de perfil?',
                    ok: 'Eliminar imagen',
                    ariaLabel: 'Eliminar imagen de perfil',
                    cancel: 'Cancelar'
                })
            ).then(function () {
                let deletePromise = vm.own ? employeeFactory.deleteMyProfilePicture : employeeFactory.deleteProfilePicture;
                deletePromise(vm.employee.id).then(() => {
                    $mdToast.showSimple('La imagen de perfil ha sido eliminada');
                    vm.timestamp = moment().format('X');
                }, () => {
                    $mdToast.showSimple('La imagen de perfil no pudo ser eliminada');
                });
            });
        };
    }
})();