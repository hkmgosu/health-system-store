(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-maintainer></ssvq-patient-maintainer>
     */
    app.directive('ssvqPatientMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientMaintainer/patientMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, patientFactory, utilitiesFactory) {
        var vm = this;
        vm.page = 1;
        vm.limit = 20;
        vm.searchText = '';
        vm.patients = [];
        vm.gender = utilitiesFactory.getGender();
        vm.idType = utilitiesFactory.getIdType();

        vm.get = () => {
            vm.patients = null;
            vm.promise = patientFactory.getList({
                filter: vm.searchText,
                paginate: { page: vm.page, limit: vm.limit }
            }, true).then(data => {
                vm.patients = data.list;
                vm.found = data.total;
            }, err => {
                vm.patients = [];
                vm.found = 0;
                console.log(err);
            });
        };

        vm.showDeleteConfirm = (patient) => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title($translate.instant('PATIENT.DELETE.TITLE'))
                    .textContent($translate.instant('PATIENT.DELETE.TEXTCONTENT'))
                    .ok($translate.instant('PATIENT.DELETE.OK'))
                    .ariaLabel($translate.instant('PATIENT.DELETE.TITLE'))
                    .cancel($translate.instant('PATIENT.DELETE.CANCEL'))
            ).then(() => {
                $mdToast.showSimple($translate.instant('PATIENT.OTHERS.DELETING'));
                patientFactory.delete(patient.id).then((response) => {
                    $mdToast.showSimple($translate.instant(response.msg));
                    vm.get();
                }, () => $mdToast.showSimple('El paciente no pudo ser eliminado'));
            });
        };

        vm.showPatientDialog = (tmpPatient, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/patient/patientMaintainer/dialog.patientDetails.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.patient);

                        vm.idTypeVisibility = { nn: false };
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: { patient: angular.copy(tmpPatient) }
            }).then(patient => {
                if (patient.id) { return; }
                $mdToast.showSimple($translate.instant('PATIENT.OTHERS.SAVING'));
                patientFactory.save(patient).then(() => {
                    $mdToast.showSimple('El paciente ha sido ingresado');
                }, () => $mdToast.showSimple('El paciente no ha podido ser ingresado')
                );
            });
        };

        $scope.$watch(() => { return vm.searchText; }, (newValue) => {
            vm.page = 1;
            vm.get();
        });

        vm.findGender = (gender) => {
            return (_.find(vm.gender, { value: gender }) || {}).name;
        };

        vm.findIdType = (idType) => {
            return (_.find(vm.idType, { value: idType }) || {}).name;
        };
    }
})();