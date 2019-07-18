(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-upp-form></ssvq-adverse-event-upp-form>
     */
    app.directive('ssvqAdverseEventUppForm', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '=',
                patient: '=',
                origin: '=',
                damageType: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventForm/uppForm/uppForm.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, adverseEventFactory) {
        var vm = this;
        vm.data = vm.data || {};
        var prevUpps = [];

        if (vm.data) {
            if ((vm.data.causes || []).length > 0) {
                vm.data.causes = _.map(vm.data.causes, cause => {
                    cause.grade = (cause.grade || {}).id;
                    cause.localization = (cause.localization || {}).id;
                    return cause;
                });
            } else {
                vm.data.causes = [];
            }
            vm.data.dependenceRisk = (vm.data.dependenceRisk || {}).id;
        } else {
            vm.data.causes = [];
        }

        var damageCategorization = adverseEventFactory.getDamageCategorization();
        var filterOptions = () => {
            if (_.indexOf(damageCategorization.sentinel, vm.damageType) >= 0) {
                vm.parametrics.gradesUpp = _.filter(vm.parametrics.gradesUpp, obj => { return _.indexOf([4], obj.id) >= 0 });
            }
            if (_.indexOf(damageCategorization.adverse, vm.damageType) >= 0) {
                vm.parametrics.gradesUpp = _.filter(vm.parametrics.gradesUpp, obj => { return _.indexOf([1, 2, 3, 5, 6], obj.id) >= 0 });
            }
        };

        (() => {
            adverseEventFactory
                .getAllParametricsUppForm()
                .then(data => {
                    vm.parametrics = data.obj;
                    vm.parametrics.uppAreas = adverseEventFactory.getUppAreas();
                    filterOptions();
                }).catch(err => {
                    console.log(err);
                    vm.parametrics = {};
                });
        })();

        (() => {
            adverseEventFactory
                .getUppsPatient(vm.patient || 1)
                .then(data => {
                    _.remove(data, cause => {
                        return cause.grade.name === '4';
                    });
                    prevUpps = data;
                }).catch(err => {
                    console.log(err);
                });
        })();

        vm.getGrade = grade => {
            return _.find(vm.parametrics.gradesUpp, { id: parseInt(grade) });
        };

        vm.getLocalization = localization => {
            return _.find(vm.parametrics.localizationsUpp, { id: parseInt(localization) });
        };

        var addCause = cause => {
            cause.uppNumber = (vm.data.causes || []).length + 1;
            cause.patient = vm.patient;
            cause.origin = vm.origin;
            vm.data.causes.push(cause);
        };

        vm.rmCause = uppNumber => {
            _.remove(vm.data.causes, { uppNumber: uppNumber });
            _.map(vm.data.causes, (cause, index) => {
                cause.uppNumber = index + 1;
            });
        };

        vm.getMatches = (filter, nameParametric) => {
            var promise = adverseEventFactory.getParametricsAutocomplete(filter, nameParametric)
                .then(response => {
                    return (response.obj || {}).parametrics || [];
                }, err => {
                    console.log(err);
                    return [];
                });
            return promise;
        };

        vm.showUppDialog = ($event, data) => {
            return $mdDialog.show({
                parent: angular.element(document.querySelector('#adverse-event-dialog')),
                multiple: true,
                targetEvent: $event || null,
                clickOutsideToClose: false,
                escapeToClose: true,
                templateUrl: '/components/adverseEvent/adverseEventForm/uppForm/dialog.uppForm.html',
                /* @ngInject */
                controller: function ($scope, parametrics, prevUpps, addCause, data, getLocalization) {
                    var vm = this;
                    vm.parametrics = parametrics;
                    if (data) vm.tempData = angular.copy(data);
                    vm.prevUpps = prevUpps;
                    vm.data = data;
                    vm.area = (getLocalization((vm.tempData || {}).localization) || {}).area;
                    vm.booleanOptions = [{ name: 'Si', id: true }, { name: 'No', id: false }];
                    vm.selectUpp = (upp, wizard) => {
                        vm.area = upp.localization.area;
                        vm.tempData = {};
                        vm.tempData.causeUpp = upp.id;
                        vm.tempData.localization = upp.localization.id;
                        vm.tempData.tracingUpp = 2;
                        wizard.currentStep = 2
                    };
                    vm.addUpp = () => {
                        vm.tempData.tracingUpp = vm.tempData.tracingUpp || 1;
                        addCause(vm.tempData);
                        $mdDialog.hide();
                    };
                    vm.saveUpp = () => {
                        angular.merge(data, vm.tempData);
                        $mdDialog.hide();
                    };
                    vm.cancel = () => {
                        $mdDialog.hide();
                    };
                },
                controllerAs: 'vm',
                locals: {
                    parametrics: vm.parametrics,
                    prevUpps: prevUpps,
                    addCause: addCause,
                    getLocalization: vm.getLocalization,
                    data: data
                }
            })
        };
    }
})();