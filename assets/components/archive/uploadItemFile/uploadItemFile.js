(function () {
    'use strict';
    /**
     * Example
     * <ssvq-upload-item-file></ssvq-upload-item-file>
     */
    app.directive('ssvqUploadItemFile', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                file: '=',
                remove: '&',
                complete: '&',
                requestId: '@',
                commentId: '@',
                mode: '@' // Viewer | Manager 
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/archive/uploadItemFile/uploadItemFile.html'
        };
    });

    /* @ngInject */
    function ComponentController($translate, $mdToast, $q, Upload, $mdDialog, $scope) {
        var vm = this;
        vm.removeFile = removeFile;
        vm.downloadFile = downloadFile;
        var uploadPromise;
        var isAborted = false;
        vm.progress = null;

        function upload(file) {
            if (file) {
                dataForView();
                vm.progress = 0;

                uploadPromise = Upload.upload({
                    url: '/archive/uploadArchive',
                    data: { file: file }
                });

                uploadPromise.then(function (response) {
                    (response.data.ok) ? uploadComplete(response.data.obj) : uploadError();
                }, function (response) {
                    if (isAborted) {
                        isAborted = false;
                    } else {
                        uploadError(response);
                    }
                }, function (evt) {
                    let progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    vm.progress = progress < 100 ? progress : null;
                });
            }
        }

        function showFileDialog() {
            $mdDialog.show({
                multiple: true,
                parent: angular.element(document.querySelector('md-dialog')),
                clickOutsideToClose: true,
                templateUrl: '/components/archive/uploadItemFile/dialog.file-preview.tmpl.html',
                locals: {
                    pathFile: pathFile + '&inline=true',
                    typeFile: vm.file.class,
                    nameFile: vm.file.name
                },
                controller: function DialogController($scope, $mdDialog, pathFile, typeFile, nameFile) {
                    $scope.pathFile = pathFile;
                    $scope.typeFile = typeFile;
                    $scope.nameFile = nameFile;
                    $scope.cancel = function () {
                        $mdDialog.hide();
                    };
                    $scope.msg = '';
                }
            });
        }

        function removeFile() {
            if (vm.progress && vm.progress < 100) {
                isAborted = true;
                uploadPromise.abort();
            }
            vm.remove();
        }

        function uploadComplete(data) {
            vm.file.id = data.id;
            pathFile = '/archive/attachmentByOwner?id=' + data.id;
            var message = 'Archivo cargado ' + vm.file.name;
            vm.complete();
            $mdToast.showSimple($translate.instant(message));
        }

        function uploadError(response) {
            var message = 'Ha ocurrido un error - ';
            if (response && response.data.code === "E_EXCEEDS_UPLOAD_LIMIT") {
                message += 'Tamaño supera el límite permitido: ' + AppUtils.toHumanSize(response.data.maxBytes);
            } else if (response) {
                message += 'Código de error ' + response.status;
            } else {
                message += 'Error desconocido';
            }
            $mdToast.showSimple(message);
            vm.remove();
        }

        function dataForView() {
            if (vm.file) {
                vm.file.class = AppUtils.mapType(vm.file.type || vm.file.mimeType);
                vm.file.sizeHuman = AppUtils.toHumanSize(vm.file.size);
            }
        }

        function downloadFile(download) {
            if (download) {
                window.location.href = pathFile;
            } else {
                if (vm.file.class === 'pdf' || vm.file.class === 'image') {
                    showFileDialog();
                } else {
                    window.location.href = pathFile;
                }
            }
        }

        if (!vm.forDownload && vm.file.id === undefined) {
            upload(vm.file);
        }

        var pathFile = '/archive/attachment?id=' + vm.file.id + '&request=' + vm.requestId;
        if (vm.commentId) {
            pathFile = pathFile + '&comment=' + vm.commentId;
        }

        dataForView();
    }
})();