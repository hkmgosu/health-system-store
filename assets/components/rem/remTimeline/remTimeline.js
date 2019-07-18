(function () {
    'use strict';
    /**
     * <ssvq-rem-timeline></ssvq-rem-timeline>
     */
    app.directive('ssvqRemTimeline', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRem: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remTimeline/remTimeline.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, remFactory) {
        var vm = this;
        angular.merge(vm, {
            /* Variables */
            showAll: false,
            setShowAll: function () {
                vm.showAll = true;
                vm.timelineView = vm.timeline;
            }
        });
        remFactory
            .getTimeline(vm.idRem)
            .then(function (res) {
                let timeline = _.concat(
                    res.comments || [],
                    res.logRem || [],
                    res.logPatient || [],
                    res.logVehicle || []
                );
                vm.timeline = _.orderBy(timeline, 'createdAt', 'asc');
            });

        var socketRem = function (event) {
            if (event.id == vm.idRem) {
                switch (event.data.message) {
                    case 'rem:new-comment':
                        vm.timeline.push(event.data.data);
                        break;
                    case 'remLog':
                        vm.timeline.push(event.data.data.remLog);
                        break;
                    case 'remLogPatient':
                        vm.timeline.push(event.data.data.log);
                        break;
                    case 'remLogVehicle':
                        vm.timeline.push(event.data.data.log);
                        break;
                    default:
                        console.warn('Unrecognized socket event (`%s`) from server:', event.verb, event);
                }
            }
        };
        io.socket.on('rem', socketRem);
        $scope.$on('$destroy', function () {
            io.socket.off('rem', socketRem);
        });
        $scope.$watchCollection(function () { return vm.timeline; }, function () {
            if (vm.showAll) {
                vm.timelineView = vm.timeline;
            } else {
                vm.timelineView = _.takeRight(vm.timeline, 3);
            }
        });

        vm.getIconClass = (type) => {
            if (!type) { return 'zmdi-comment'; }
            if (type.toLowerCase().includes('patient')) { return 'zmdi-account' };
            if (type.toLowerCase().includes('vehicle')) { return 'zmdi-truck' };
            if (type.toLowerCase().includes('address')) { return 'zmdi-pin' };
            return 'zmdi-info';
        };
    }
})();