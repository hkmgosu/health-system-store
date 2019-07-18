(() => {
    'use strict';
    /**
      * Example
      * <ssvq-participant-list-avatar></ssvq-participant-list-avatar>
      */
    app.directive('ssvqParticipantListAvatar', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                participantList: '=',
                showHistory: '=',
                avatarClass: '@?'
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/participant/participantListAvatar/participantListAvatar.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog) {
        var vm = this;

        vm.onParticipantClick = (participant, $event) => {
            if (!vm.showHistory) { return; }
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/participant/participantListAvatar/dialog.employeeHistory.html',
                /* @ngInject */
                controller: function ($mdDialog, workshiftFactory) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide();
                    workshiftFactory.getEmployeeHistory(vm.participant.member.id, vm.participant.startTime).then(list => {
                        vm.participantHistory = list;
                    });
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { participant: participant }
            });
        };
    }
})();