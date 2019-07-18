(() => {
    'use strict';
    /**
     * Example
     * <ssvq-patient-clinical-history></ssvq-patient-clinical-history>
     */
    app.directive('ssvqPatientClinicalHistory', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idPatient: '@',
                count: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientClinicalHistory/patientClinicalHistory.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, remFactory, patientFactory, remAttentionFactory, $remPatientFactory) {
        var vm = this;
        vm.clinicalHistory = [];

        patientFactory.getClinicalHistory(vm.idPatient).then(clinicalHistory => {
            vm.clinicalHistory = clinicalHistory;
            vm.count = clinicalHistory.length;
        }, err => console.log(err));

        /**
         *  Obtener detalle de la atención realizada en el incidente seleccionado
         */
        vm.loadData = (remPatient) => {
            vm.viewDetail = true;
            vm.ecg = [];
            vm.attentionClasses = [];
            async.parallel({
                patientAttentions: cb => remAttentionFactory.getRemPatientAttentions({ remPatient: remPatient.id }).then(
                    list => cb(null, list), cb
                ),
                remPatient: cb => $remPatientFactory.getHistoryItemDetails(remPatient.id).then(
                    obj => cb(null, obj), cb
                ),
                attentionClassList: cb => remAttentionFactory.getAllClasses({ populate: true }).then(list => cb(null, list)),
            }, (err, result) => {
                if (err) { return console.log(err); }
                let itemDetails = result.remPatient;
                itemDetails.loadedData = true;
                // Map signos vitales
                itemDetails.vitalSigns = _.map(itemDetails.vitalSigns, vitalSigns => {
                    vitalSigns.ecg = (_.filter(vm.ecg, { id: parseInt(vitalSigns.ecg) })[0] || {}).name;
                    return vitalSigns;
                });
                // Map atenciones
                let setAttentions = [].concat.apply([], _.map(result.attentionClassList, 'items'));
                itemDetails.setAttentions = _.map(result.patientAttentions, attention => {
                    let temp = (_.filter(setAttentions, { id: attention.attentionItem }) || [])[0];
                    attention.name = temp.name;
                    return attention;
                });
                itemDetails.rem = remPatient.rem;
                vm.itemDetails = itemDetails;
            });
        };

        vm.goBack = () => {
            vm.viewDetail = false;
            vm.itemDetails = null;
        };
    }
})();