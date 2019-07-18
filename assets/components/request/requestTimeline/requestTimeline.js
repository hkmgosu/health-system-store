(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-timeline idRequest=""></ssvq-request-timeline>
     */
    app.directive('ssvqRequestTimeline', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRequest: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestTimeline/requestTimeline.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, requestFactory) {
        var vm = this;
        angular.merge(vm, {
            /* Variables */
            myComment: {
                request: vm.idRequest,
                description: '',
                attachments: []
            },
            showAll: false,
            setShowAll: function () {
                vm.showAll = true;
                vm.timelineView = vm.timeline;
            }
        });
        requestFactory
            .getTimeline(vm.idRequest)
            .then(function (response) {
                if (response.ok) {
                    (response.obj.unitAssignmentLog).forEach(o => {
                        o.type = "unitAssigned";
                    });
                    (response.obj.assignmentLog).forEach(o => {
                        o.type = "employeeAssigned";
                    });
                    (response.obj.stateLog).forEach(o => {
                        o.type = "stateChanged";
                    });
                    vm.timeline = _.concat(
                        response.obj.comments || [],
                        response.obj.assignmentLog || [],
                        response.obj.stateLog || [],
                        response.obj.unitAssignmentLog || [],
                        response.obj.requestLog || [],
                        response.obj.stakeholdersLog || []
                    );
                    vm.timeline = _.orderBy(vm.timeline, 'createdAt', 'asc');
                } else {
                    vm.timeline = [];
                }
            });

        var socketRequest = function (event) {
            if (event.id == vm.idRequest) {
                switch (event.data.message) {
                    case 'request:new-comment':
                        vm.timeline.push(event.data.data);
                        break;
                    case 'request:new-state':
                        vm.timeline.push(event.data.data);
                        break;
                    case 'request:new-employeeAssigned':
                        vm.timeline.push(event.data.data);
                        break;
                    case 'request:new-unitAssigned':
                        vm.timeline.push(event.data.data);
                        break;
                    case 'request:new-dueDate':
                        vm.timeline.push(event.data.data);
                        break;
                    case 'request:new-label':
                        vm.timeline.push(event.data.data);
                        break;
                    case 'request:stakeholder-added':
                        if (event.data.data.timeline) {
                            vm.timeline.push(event.data.data);
                        }
                        break;
                    case 'request:stakeholder-removed':
                        if (event.data.data.timeline) {
                            vm.timeline.push(event.data.data);
                        }
                        break;
                    default:
                        console.warn('Unrecognized socket event (`%s`) from server:', event.verb, event);
                }
                $scope.$apply();
            }
        };
        io.socket.on('request', socketRequest);
        $scope.$on('$destroy', () => io.socket.off('request', socketRequest));

        $scope.$watchCollection(function () { return vm.timeline; }, timeline => {
            if (timeline) {
                if (vm.showAll) {
                    vm.timelineView = timeline;
                } else {
                    vm.timelineView = _.takeRight(timeline, 3);
                }
            }
        });
    }
})();