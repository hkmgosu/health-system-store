(() => {
    'use strict';
    /**
     * Example
     * <ssvq-patient-intervention></ssvq-patient-intervention>
     */
    app.directive('ssvqPatientIntervention', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRemPatient: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientIntervention/patientIntervention.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, remAttentionFactory, remTransferStatusFactory, remFactory, $mdToast, $remPatientFactory) {
        var vm = this;
        vm.remPatient = vm._remPatient ? vm.remPatient : {};
        vm.transferStatusList = [];
        vm.attentionClassList = [];
        var prepareAttentions, prepareTransferStatus;

        async.parallel({
            transferStatusList: cb => remTransferStatusFactory.getAll().then(list => cb(null, list)),
            attentionClassList: cb => remAttentionFactory.getAllClasses({ populate: true }).then(list => cb(null, list)),
            getRemPatientAttentions: cb => remAttentionFactory.getRemPatientAttentions({
                remPatient: vm.idRemPatient
            }).then(setAttentions => cb(null, setAttentions), cb),
            getRemPatient: cb => $remPatientFactory.get(vm.idRemPatient).then(remPatient => cb(null, remPatient), cb)
        }, (err, results) => {
            if (err) { return console.log(err); }
            vm.remPatient = _.pick(results.getRemPatient, [
                'id',
                'descriptionIntervention',
                'diagnosticIntervention',
                'typeTransfer',
                'transferStatus',
                'hasIntervention',
                'criticalIntervention',
                'adhocCall'
            ]);
            vm.remPatient.setAttentions = results.getRemPatientAttentions;
            vm.transferStatusList = results.transferStatusList || [];
            vm.attentionClassList = results.attentionClassList || [];

            prepareAttentions(results.getRemPatientAttentions);
            prepareTransferStatus(results.getRemPatient.transferStatus);
        });

        vm.saveIntervention = () => {
            if (!vm.remPatient.id) { return; }
            let tempRemPatient = angular.copy(vm.remPatient);

            // Map transferStatus
            tempRemPatient.transferStatus = _.map(vm.transferStatusList, status => {
                if (status.initialValue && !status.currentValue) {
                    return { id: status.id, deleted: true };
                }
                if (!status.initialValue && status.currentValue) {
                    return { id: status.id, deleted: false };
                }
            });
            _.remove(tempRemPatient.transferStatus, _.isUndefined);

            // Map setAttentions
            tempRemPatient.setAttentions = [];
            vm.attentionClassList.forEach(attentionClass => {
                attentionClass.items.forEach(attentionItem => {
                    if (
                        (attentionItem.remPatientAttention.id && attentionItem.remPatientAttention.deleted) ||
                        (!attentionItem.remPatientAttention.id && !attentionItem.remPatientAttention.deleted)
                    ) {
                        tempRemPatient.setAttentions.push(attentionItem.remPatientAttention);
                    }
                });
            });

            // Envío de solicitud
            remFactory.saveRemPatientIntervention(tempRemPatient).then(data => {
                vm.remPatient.hasIntervention = true;
                vm.interventionForm.$setPristine();
                vm.interventionForm.$setUntouched();
                $mdToast.showSimple('Datos de intervención guardados');
            }, err => {
                console.log(err);
                $mdToast.showSimple('Ha ocurrido un error');
            });
        };

        prepareAttentions = (remPatientAttentions) => {
            vm.attentionClassList.forEach(attentionClass => {
                attentionClass.items.forEach(attentionItem => {
                    attentionItem.remPatientAttention = _.find(remPatientAttentions, { attentionItem: attentionItem.id }) || {
                        attentionItem: attentionItem.id
                    };
                    attentionItem.remPatientAttention.id ? attentionClass.show = attentionItem.remPatientAttention.id : null;
                });
            });
        };

        prepareTransferStatus = (remPatientTransferStatus) => {
            vm.transferStatusList.forEach(transferStatus => {
                transferStatus.initialValue = transferStatus.currentValue = _.some(remPatientTransferStatus, { id: transferStatus.id });
            });
        };

    }
})();