(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-details-view></ssvq-employee-details-view>
     */
    app.directive('ssvqEmployeeDetailsView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employeeDetailsView/employeeDetailsView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $stateParams, $mdToast, employeeFactory, $translate, $resourceFactory) {
        var vm = this;
        let idEmployee = parseInt($stateParams.id);
        if (!idEmployee) { return; }
        employeeFactory.get(idEmployee).then(employee => {
            employee.birthdate = employee.birthdate ? new Date(employee.birthdate) : null;
            vm.employee = employee;
            $scope.$apply();
        }, () => {
            $mdToast.showSimple('El funcionario no existe');
            window.location.href = '#/funcionarios';
        });

        /**
         * Obtener paramétricas
         */
        employeeFactory.getParams().then(parametricObj => vm.parametricObj = parametricObj);

        /**
         * Guardar cambios
         */
        vm.saveGeneralDataForm = () => {
            employeeFactory.save(_.pick(vm.employee, [
                'id', 'name', 'lastname', 'mlastname', 'gender', 'birthdate', 'annexe', 'personalEmail', 'email'
            ])).then(() => {
                vm.generalDataForm.$setPristine();
                vm.generalDataForm.$setUntouched();
                $mdToast.showSimple('La información general fue actualizada');
            }), () => $mdToast.showSimple('No se pudo actualizar la información del funcionario');
        };
        vm.saveJobDataForm = () => {
            employeeFactory.save({
                id: vm.employee.id,
                job: vm.employee.job ? vm.employee.job.id : null,
                unit: vm.employee.unit ? vm.employee.unit.id : null,
                establishment: vm.employee.establishment ? vm.employee.establishment.id : null,
                legalquality: vm.employee.legalquality ? vm.employee.legalquality.id : null,
                level: vm.employee.level,
                plant: vm.employee.plant ? vm.employee.plant.id : null,
                afp: vm.employee.afp ? vm.employee.afp : null,
                healthcare: vm.employee.healthcare ? vm.employee.healthcare.id : null
            }).then(() => {
                vm.jobDataForm.$setPristine();
                vm.jobDataForm.$setUntouched();
                $mdToast.showSimple('La información laboral fue actualizada');
            }, () => $mdToast.showSimple('No se pudo actualizar la información del funcionario'));
        };
        vm.saveOtherDataForm = () => {
            employeeFactory.save(_.pick(vm.employee, [
                'id', 'profile'
            ])).then(() => {
                vm.otherDataForm.$setPristine();
                vm.otherDataForm.$setUntouched();
                $mdToast.showSimple('La información extra fue actualizada');
            }, () => $mdToast.showSimple('No se pudo actualizar la información del funcionario'));
        };
        vm.onSamuFullAccessChange = () => {
            employeeFactory.save(_.pick(vm.employee, [
                'id', 'samuFullAccess'
            ])).then(() => {
                $mdToast.showSimple('Funcionario actualizado correctamente');
            }, () => $mdToast.showSimple('No se pudo actualizar la información del funcionario'));
        };

        vm.genderList = [{
            text: 'Masculino',
            code: 'male'
        }, {
            text: 'Femenino',
            code: 'female'
        }];

        $resourceFactory.getEmployeeResourceList(idEmployee).then(employeeResourceList => {
            vm.employeeResourceList = employeeResourceList;
        });

        vm.onDelete = () => window.location.href = '#/funcionarios';

        vm.manageProfileList = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/employee/employeeDetailsView/dialog.profileManager.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, $mdToast, employeeFactory) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide();

                        vm.addProfile = profile => {
                            if (_.isEmpty(profile)) { return; }
                            if (_.find(vm.employee.profileList, { id: profile.id })) {
                                return $mdToast.showSimple('El funcionario ya tiene el perfil seleccionado');
                            }
                            employeeFactory.addProfile(vm.employee.id, profile.id).then(() => {
                                vm.employee.profileList.push(profile);
                                $mdToast.showSimple('El perfil ' + profile.name + ' fue agregado a la cuenta de ' + vm.employee.fullname);
                            }, err => {
                                console.log(err);
                                $mdToast.showSimple('Ha ocurrido un error agregando el perfil');
                            });
                        };
                        vm.removeProfile = profile => {
                            employeeFactory.removeProfile(vm.employee.id, profile.id).then(() => {
                                _.remove(vm.employee.profileList, { id: profile.id });
                                $mdToast.showSimple('El perfil ' + profile.name + ' fue quitado de la cuenta de' + vm.employee.fullname);
                            }, err => {
                                console.log(err);
                                $mdToast.showSimple('Ha ocurrido un error quitando el perfil');
                            });
                        };
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    employee: vm.employee
                }
            });
        };

        vm.editUnitReported = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/employee/employeeDetailsView/dialog.unitReported.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, $workflowFactory) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.employee);

                        $workflowFactory.getUnitReported(vm.employee.id).then(unit => {
                            vm.defaultReportUnit = unit;
                        });
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    employee: angular.copy(vm.employee)
                }
            }).then(employeeUpdated => {
                employeeFactory.save(_.pick(employeeUpdated, [
                    'id', 'managedByUnit'
                ])).then(() => {
                    vm.employee.managedByUnit = employeeUpdated.managedByUnit;
                    $mdToast.showSimple('La unidad de reporte fue actualizada');
                }, () => $mdToast.showSimple('No se pudo actualizar la información del funcionario'));
            });
        };
    }
})();