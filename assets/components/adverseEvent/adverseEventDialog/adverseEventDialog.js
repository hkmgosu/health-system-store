(() => {
    'use strict';
    app.provider('$adverseEventDialog', () => {
        return {
            $get: customProvider
        };
    });

    /* @ngInject */
    function customProvider($mdDialog, $mdToast, $translate, $location, adverseEventFactory) {
        var prevStep = (wizard, typeNotification, typeForm) => {
            if (wizard.currentStep === 2 && typeNotification === 'withoutPatient') {
                wizard.currentStep = 0;
            } else if (wizard.currentStep === 6 && typeNotification === 'withoutPatient') {
                wizard.currentStep = 3;
            } else if (wizard.currentStep === 6 && typeForm === 'FormGeneral') {
                wizard.currentStep = 4;
            } else {
                wizard.prevStep();
            }
        };

        var nextStep = (wizard, typeNotification) => {
            if (wizard.isFormValid(wizard.currentStep)) {
                if (wizard.currentStep === 3 && typeNotification === 'withoutPatient') {
                    wizard.currentStep = 6;
                } else {
                    wizard.nextStep();
                }
            } else {
                let patientForm = wizard.getForm(wizard.currentStep).patientForm;
                if (patientForm) {
                    patientForm.patientAutocompleteForm ? patientForm.patientAutocompleteForm.$setSubmitted() : null;
                    patientForm.patientPersonalDataForm ? patientForm.patientPersonalDataForm.$setSubmitted() : null;
                }
                wizard.getForm(wizard.currentStep).$setSubmitted();
            }
        };

        var showDialog = ($event, data, anonimo) => {
            return $mdDialog.show({
                targetEvent: $event || null,
                clickOutsideToClose: false,
                escapeToClose: true,
                templateUrl: '/components/adverseEvent/adverseEventDialog/adverseEventDialog.html',
                /* @ngInject */
                controller: function ($scope, data, anonimo) {
                    var vm = this;
                    vm.tupleSelected = {};
                    vm.prevStep = prevStep;
                    vm.nextStep = nextStep;
                    vm.sending = false;
                    vm.anonimo = anonimo;
                    vm.event = data && data.event ? angular.copy(data.event) : {}; //Datos generales del evento
                    vm.formData = data && data.form ? angular.copy(data.form) : {}; //Datos del formulario tipo según el evento
                    vm.damageCategorization = adverseEventFactory.getDamageCategorization();
                    vm.booleanOptions = [{ name: 'Si', id: true }, { name: 'No', id: false }];
                    vm.cancel = () => $mdDialog.cancel();
                    vm.selectType = (opt) => {
                        vm.event.typeNotification = opt;
                    };
                    vm.sendForm = () => {
                        vm.sending = true;
                        if (vm.event.typeNotification === 'withoutPatient') {
                            vm.event = _.omit(vm.event, 'patient');
                        }
                        vm.event.anonimo = vm.anonimo;
                        if (vm.event.id) {
                            adverseEventFactory
                                .updateEvent(vm.event, vm.formData)
                                .then(response => {
                                    $mdToast.showSimple($translate.instant(response.msg));
                                    $mdDialog.hide(true);
                                }, err => {
                                    console.log(err);
                                    $mdDialog.hide(false);
                                    $mdToast.showSimple($translate.instant(err.msg));
                                });
                        } else {
                            adverseEventFactory
                                .createEvent(vm.event, vm.formData)
                                .then(response => {
                                    $mdToast.showSimple($translate.instant(response.msg));
                                    $mdDialog.hide();
                                    if (!vm.anonimo) $location.path('/eventos-adversos/detalles/' + response.obj.id);
                                }, err => {
                                    console.log(err);
                                    vm.sending = false;
                                    $mdToast.showSimple($translate.instant(err.msg));
                                });
                        }
                    };
                    $scope.$watch(() => { return (vm.event.patient || {}).id }, newVal => {
                        if (!newVal || vm.event.id) return;
                        adverseEventFactory
                            .getEventsPatient(newVal)
                            .then(response => {
                                if ((response.obj || []).length > 0) {
                                    $mdDialog.show({
                                        parent: angular.element(document.querySelector('#adverse-event-dialog')),
                                        multiple: true,
                                        templateUrl: '/components/adverseEvent/adverseEventDialog/eventsPatientDialog.html',
                                        // @ngInject 
                                        controller: function ($scope, events, cancel) {
                                            var vm = this;
                                            vm.events = events;
                                            vm.continue = () => {
                                                $mdDialog.hide();
                                            }
                                            vm.cancel = () => {
                                                $mdDialog.hide();
                                                cancel();
                                            };
                                        },
                                        controllerAs: 'vm',
                                        locals: {
                                            events: response.obj,
                                            cancel: vm.cancel
                                        }
                                    });
                                }
                            }, err => {
                                console.log(err);
                            });
                    });
                },
                controllerAs: 'vm',
                locals: {
                    data: data,
                    anonimo: anonimo
                }
            });
        };

        return {
            show: ($event, data, anonimo) => showDialog($event, data, anonimo)
        };
    }
})();