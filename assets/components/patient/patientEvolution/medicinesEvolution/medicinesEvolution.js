(function () {
    'use strict';
    /**
     * Example
     * <ssvq-medicines-evolution></ssvq-medicines-evolution>
     */
    app.directive('ssvqMedicinesEvolution', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRemPatient: '@',
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientEvolution/medicinesEvolution/medicinesEvolution.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, remFactory, $mdToast, $remPatientFactory) {
        var vm = this;
        vm.prescribedMedicines = [];

        // Obtener historial de medicinas suministradas
        $remPatientFactory.getMedicineHistory(vm.idRemPatient).then(prescribedMedicines => vm.prescribedMedicines = prescribedMedicines);

        // Agregar un ítem al historial de medicinas suministradas
        vm.save = (data) => {
            if (!vm.idRemPatient) { return; }
            remFactory.saveRemPatientMedicines({
                id: vm.idRemPatient,
                medicines: data
            }).then(response => {
                vm.saveForm.$setPristine();
                vm.saveForm.$setUntouched();
                vm.prescribedMedicines.push(response.pop());
                vm.tempPrescribed = {};
                $mdToast.showSimple('Medicina guardada');
            }, err => {
                console.log(err);
                $mdToast.showSimple('Ha ocurrido un error');
            });
        };

        // Eliminar un historial de medicina suministrado
        vm.removeMedicine = (data) => {
            remFactory.deleteRemPatientMedicines({
                id: vm.idRemPatient,
                medicines: data
            }).then(() => {
                _.remove(vm.prescribedMedicines, { id: data.id });
                $mdToast.showSimple('Medicina borrada');
            }, err => {
                console.log(err);
                $mdToast.showSimple('Ha ocurrido un error');
            });
        };

    }
})();