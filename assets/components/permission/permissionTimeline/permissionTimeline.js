(() => {
    'use strict';
    /**
     * Example
     * <ssvq-permission-timeline id-permission=""></ssvq-permission-timeline>
     */
    app.directive('ssvqPermissionTimeline', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idPermission: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionTimeline/permissionTimeline.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $permissionFactory) {
        var vm = this;
        angular.merge(vm, {
            /* Variables */
            showAll: false,
            setShowAll: () => {
                vm.showAll = true;
                vm.timelineView = vm.timeline;
            }
        });
        $permissionFactory
            .getTimeline(vm.idPermission)
            .then((response) => {
                (response.statusLog).forEach(o => {
                    o.type = "statusChanged";
                });
                vm.timeline = _.concat(
                    response.comments || [],
                    response.statusLog || []
                );
                vm.timeline = _.orderBy(vm.timeline, 'createdAt', 'asc');
            })
            .catch(err => {
                console.log(err);
                vm.timeline = [];
            });

        var socketRequest = function (event) {
            if (event.id == vm.idPermission) {
                vm.timeline.push(event.data.data);
                $scope.$apply();
            }
        };
        io.socket.on('permission', socketRequest);
        $scope.$on('$destroy', () => io.socket.off('permission', socketRequest));

        $scope.$watchCollection(() => { return vm.timeline; }, timeline => {
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