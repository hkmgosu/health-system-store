(function() {
    'use strict';
    /**
     * Example
     * <ssvq-product-profile-picture-selector product="{}"></ssvq-product-profile-picture-selector>
     */
    app.directive('ssvqProductProfilePictureSelector', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                product: '=',
                onChange: '&?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/product/productProfilePictureSelector/productProfilePictureSelector.html'
        };
    });

    /* @ngInject */
    function ComponentController(Upload, productFactory, $mdDialog, $mdToast) {
        var vm = this;
        vm.timestamp = moment().format('X');

        vm.selectFile = ($file) => {
            if (!$file) {
                return;
            }

            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/storage/product/productProfilePictureSelector/dialog.cropImage.html',
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
                locals: {
                    file: $file
                }
            }).then(pictureUrl => {
                console.log('uploading file for ', vm.product.id);
                vm.processing = true;
                Upload.upload({
                    url: 'storage/product/uploadProductProfilePicture',
                    data: {
                        file: Upload.dataUrltoBlob(pictureUrl),
                        idProduct: vm.product.id
                    }
                }).then(() => {
                    $mdToast.showSimple('La imagen de perfil de producto ha sido actualizada');
                    vm.timestamp = moment().format('X');
                    vm.processing = false;
                    vm.product.hasProfilePicture = true;
                    vm.onChange()();
                }, reason => {
                    $mdToast.showSimple('La imagen de perfil de producto no ha podido ser actualizada');
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
                    title: 'Eliminación de imagen de perfil de producto',
                    textContent: '¿Seguro que deseas eliminar la imagen de perfil de producto?',
                    ok: 'Eliminar imagen',
                    ariaLabel: 'Eliminar imagen de perfil de producto',
                    cancel: 'Cancelar'
                })
            ).then(function() {
                let deletePromise = productFactory.deleteProductProfilePicture;
                deletePromise(vm.product.id).then(() => {
                    $mdToast.showSimple('La imagen de perfil ha sido eliminada');
                    vm.timestamp = moment().format('X');
                    vm.onChange()();
                }, () => {
                    $mdToast.showSimple('La imagen de perfil no pudo ser eliminada');
                });
            });
        };
    }
})();