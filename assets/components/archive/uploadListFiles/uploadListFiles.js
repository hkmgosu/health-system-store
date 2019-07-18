(function () {
    'use strict';
    /**
     * Example
     * <ssvq-upload-list-files key=""></ssvq-upload-list-files>
     */
    app.directive('ssvqUploadListFiles', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                files: '=',
                uploadFiles: '=',
                requestId: '@',
                commentId: '@',
                mode: '@', // Viewer | Manager
                onChange: '&?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/archive/uploadListFiles/uploadListFiles.html'
        };
    });

    /* @ngInject */
    function ComponentController($translate, Upload) {
        var vm = this;
        vm.filesFile = [];
        if (!vm.files) {
            vm.files = [];
        } else {
            vm.filesFile = angular.copy(vm.files);
        }

        vm.uploadFiles = ($files) => {
            if ($files !== null && $files.length > 0) {
                var fileList = [];
                vm.filesFile = _.concat(vm.filesFile, $files);
                _.map(vm.filesFile, (file, index) => {
                    if (!file.id) {
                        fileList[index] = _.pick(file, ['name']);
                    } else {
                        fileList[index] = _.pick(file, ['id']);
                    }
                });
                vm.files = fileList;
            }
        };

        vm.completeUpload = () => {
            _.map(vm.filesFile, (file, index) => {
                vm.files[index] = _.pick(file, ['id', 'name', 'type', 'size']);
            });
            vm.onChange ? vm.onChange()() : null;
        };

        vm.notDeleted = (file, index) => {
            if (vm.files[index]) {
                return file;
            } else {
                vm.filesFile.splice(index, 1);
            }
        };

        vm.remove = (index) => {
            vm.files.splice(index, 1);
            vm.filesFile.splice(index, 1);
            vm.onChange ? vm.onChange()() : null;
        };
    }
})();