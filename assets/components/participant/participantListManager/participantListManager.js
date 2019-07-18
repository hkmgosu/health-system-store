(() => {
    'use strict';
    /**
      * Example
      * <ssvq-participant-list-manager></ssvq-participant-list-manager>
      */
    app.directive('ssvqParticipantListManager', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                filter: '=',
                opts: '=',
                participantList: '='
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/participant/participantListManager/participantListManager.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdToast, participantFactory, $scope, jobFactory, workshiftFactory, $mdDialog) {
        var vm = this;

        jobFactory.get({ filter: 'samu' }).then(function (response) {
            if (response.ok) {
                vm.jobList = response.obj.jobs;
            } else {
                vm.jobList = [];
            }
        }, function (err) {
            debugger;
        });

        vm.opts = Object.assign({
            employeeFields: {
                fullname: true
            },
            showJobSelector: false,
            realTimeUpdate: false,
            onlyRead: false,
            theme: 'my-theme'
        }, vm.opts || {});

        //Agregar un participante en la lista
        vm.addParticipant = member => {
            // Si el miembro ya se encuentra en la lista debe enviar mensaje de alerta
            if (_.some(vm.participantList, participant => participant.member.id === member.id)) {
                return $mdToast.showSimple(member.fullname + ' ya se encuentra en la lista de participantes');
            }

            if (vm.opts.realTimeUpdate) {
                let participant = Object.assign({ member: member.id, deleted: false }, vm.filter);
                participantFactory.add(participant).then(participantAdded => {
                }, err => $mdToast.showSimple('Error: ' + (err || 'Error desconocido')));
            } else {
                let participant = Object.assign({ member: member, deleted: false }, vm.filter);
                vm.participantList.unshift(participant);
            }
        };

        //Quitar un participante de la lista
        vm.removeParticipant = participant => {
            if (vm.opts.realTimeUpdate) {
                participantFactory.remove(participant.id).then(() => {
                    _.remove(vm.participantList, participantItem => participantItem.member.id === participant.member.id);
                    $scope.$apply();
                }, err => $mdToast.showSimple('Ha ocurrido un error al eliminar participante'));
            } else {
                if (participant.id) { participant.deleted = true; }
                else {
                    _.remove(vm.participantList, participantItem => participantItem.member.id === participant.member.id);
                }
            }
        };

        vm.updateJob = (participant, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                parent: angular.element(document.querySelector('#care-team-edit')),
                templateUrl: '/components/participant/participantListManager/dialog.updateJob.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = (replace) => $mdDialog.hide(replace);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { participant: participant },
                multiple: true
            }).then((replace) => {
                workshiftFactory.updateJob(participant.id, participant.job, replace).then(() => {
                    $mdToast.showSimple('Cargo actualizado correctamente');
                }, () => {
                    $mdToast.showSimple('Ha ocurrido un error');
                });
            });
        };

    }
})();