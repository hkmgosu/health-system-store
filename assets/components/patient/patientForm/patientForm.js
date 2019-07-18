(() => {
    'use strict';
    /**
      * Example
      * <ssvq-patient-form></ssvq-patient-form>
      */
    app.directive('ssvqPatientForm', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                patient: '=',
                opts: '=',
                onUpdate: '&?'
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/patient/patientForm/patientForm.html'
        };
    });

    /* @ngInject */
    function ComponentController(patientFactory, $mdToast) {
        var vm = this;

        /**
         * Desde componente ssvq-address se recibe señal para actualizar y 
         * se retorna promesa
         */
        vm.saveAddress = address => new Promise((resolve, reject) => {
            if (!vm.patient.id) {
                $mdToast.showSimple('El paciente debe estar registrado para actualizar su dirección');
                async.setImmediate(reject);
            }
            patientFactory.save({
                id: vm.patient.id,
                address: address
            }).then(patient => {
                $mdToast.showSimple('Dirección del paciente actualizada correctamente');
                if (vm.onUpdate) { vm.onUpdate()(); }
                resolve();
            }, (err) => {
                $mdToast.showSimple('Ha ocurrido un error: ' + err || 'Error desconodido');
                reject();
            });
        });

        /**
         * Recibo señal de actualización en algún formulario interno y 
         * repito señal hacia el componente que me contiene
         * 
         * Ej. SAMU recibe señal y crea log
         */
        vm.onIdentifyDataUpdate = vm.onPersonalDataUpdate = () => vm.onUpdate ? vm.onUpdate()() : null;
    }
})();