(function () {
    'use strict';
    /**
     * Example
     * <ssvq-job-selector jobs=""></ssvq-job-selector>
     */
    app.directive('ssvqJobSelector', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                jobs: "="
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/job/jobSelector/jobSelector.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $q) {
        var vm = this;
        var init = function () {
            $scope.primaryJob = angular.copy(_.find($scope.jobs, { 'isPrimary': true }) || { 'isPrimary': true, 'deleted': false });
            $scope.othersJobs = _.filter($scope.jobs, { 'isPrimary': false });
            $scope.othersJobs = (_.isEmpty($scope.othersJobs)) ? [{
                isPrimary: false,
                deleted: false
            }] : $scope.othersJobs;
        };

        var getJobs = function () {
            var tmpJobs = _.concat([$scope.primaryJob], $scope.othersJobs);
            _.remove(tmpJobs, { job: null });
            tmpJobs.forEach(j => {
                delete j['$$hashKey'];
            });
            $scope.jobs = tmpJobs;
        };

        $scope.$watch('primaryJob', primaryJob => {
            getJobs();
        }, true);
        $scope.$watchCollection('othersJobs', othersJobs => {
            getJobs();
        }, true);

        angular.merge($scope, {
            /* Variables */
            /* Métodos*/
            addJob: function () {
                $scope.othersJobs.push({
                    isPrimary: false,
                    deleted: false
                });
                $scope.deleteDisabled = false;
            },
            removeJob: function (job) {
                var tempLength = _.filter($scope.othersJobs, { deleted: false }).length;
                if (job.id) {
                    job.deleted = true;
                    if (tempLength) {
                        $scope.othersJobs.push({
                            isPrimary: false,
                            deleted: false
                        });
                    }
                } else if (tempLength > 1) {
                    _.remove($scope.othersJobs, job);
                } else {
                    job = {};
                }
            },
            swapJob: function (job) {
                var tmp = angular.copy(job);
                _.remove($scope.othersJobs, job);
                $scope.othersJobs.push(_.extend($scope.primaryJob, { isPrimary: false }));
                $scope.primaryJob = _.extend(tmp, { isPrimary: true });
            }
        });
        init();
    }
})();