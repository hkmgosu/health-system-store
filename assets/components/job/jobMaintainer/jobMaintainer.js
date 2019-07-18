(function () {
    'use strict';
    /**
     * Example
     * <ssvq-job-maintainer></ssvq-job-maintainer>
     */
    app.directive('ssvqJobMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/job/jobMaintainer/jobMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, jobFactory) {
        var vm = this;
        angular.extend($scope, {
            limit: 20,
            page: 1,
            searchText: '',
            get: function () {
                $scope.jobs = null;
                $scope.promise = jobFactory.get({
                    filter: $scope.searchText,
                    limit: $scope.limit,
                    page: $scope.page
                })
                    .then(function (response) {
                        if (response.ok) {
                            $scope.jobs = response.obj.jobs;
                            $scope.found = response.obj.found;
                        } else {
                            $scope.jobs = [];
                        }
                    }, function (err) {
                        debugger;
                    });
            },
            uploadIcon: function (id, file) {
                jobFactory.uploadIcon(id, file)
                    .then(function (response) {
                        if (response.data.ok) {
                            $scope.get();
                        } else {
                            // TODO
                        }
                    }, function (err) {
                        debugger;
                    });
            },
            save: function (data) {
                $mdDialog.hide();
                $mdToast.showSimple($translate.instant('JOB.OTHERS.SAVING'));
                jobFactory.save(data)
                    .then(function (response) {
                        $mdToast.showSimple($translate.instant(response.msg));
                        if (response.ok) {
                            if ($scope.file) {
                                $scope.uploadIcon(response.obj.job.id, $scope.file[0]);
                            } else {
                                $scope.get();
                            }
                        } else {
                            // TODO
                        }
                    }, function (err) {
                        debugger;
                    });
            },
            showSaveDialog: function (job) {
                $scope.temp = angular.copy(job);
                $mdDialog.show({
                    clickOutsideToClose: true,
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: '/components/job/jobMaintainer/dialog.save.tmpl.html',
                    controller: function DialogController($scope, $mdDialog) {
                        $scope.cancel = function () {
                            $mdDialog.hide();
                        };
                        $scope.msg = '';
                    }
                })
                    .finally(function () {
                        $scope.file = undefined;
                    });
            },
            delete: function (id) {
                $mdToast.showSimple($translate.instant('JOB.OTHERS.DELETING'));
                jobFactory.delete(id)
                    .then(function (response) {
                        $mdToast.showSimple($translate.instant(response.msg));
                        if (response.ok) {
                            $scope.get();
                        } else {
                            // TODO
                        }
                    }, function () {
                        debugger;
                    });
            },
            showDeleteConfirm: function (item) {
                $mdDialog.show(
                    $mdDialog.confirm()
                        .title($translate.instant('JOB.DELETE.TITLE'))
                        .textContent($translate.instant('JOB.DELETE.TEXTCONTENT'))
                        .ok($translate.instant('JOB.DELETE.OK'))
                        .ariaLabel($translate.instant('JOB.DELETE.TITLE'))
                        .cancel($translate.instant('JOB.DELETE.CANCEL'))
                ).then(function () {
                    $scope.delete(item.id);
                }, function () {
                });
            }
        });

        $scope.$watch('searchText', function (searchText) {
            $scope.page = 1;
            $scope.get();
        });
    }
})();