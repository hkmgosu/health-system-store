(() => {
    'use strict';
    /**
      * Example
      * <ssvq-profile-details></ssvq-profile-details>
      */
    app.directive('ssvqProfileDetails', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/profile/profileDetails/profileDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($stateParams, $scope, $mdToast, profileFactory, employeeFactory, $mdDialog) {
        var vm = this;

        vm.idProfile = $stateParams.id;
        if (!vm.idProfile) { $mdToast.showSimple('URL inválida'); }

        vm.configProfile = {};

        async.parallel({
            customProfile: cb => profileFactory.getDetails(vm.idProfile).then(profile => cb(null, profile), cb),
            configProfile: cb => profileFactory.getConfigProfiles().then(profile => cb(null, profile), cb)
        }, (err, results) => {
            if (err) {
                console.log(err);
                return $mdToast.showSimple('Ha ocurrido un error obteniendo la información del perfil');
            }
            // Por default se setea la vista general dashboard con privilegio view = true
            results.configProfile.profiles.dashboard.config.privileges.view = true;
            //
            vm.profile = results.customProfile;
            _.merge(results.configProfile.profiles, results.customProfile.profiles);
            vm.configProfile = results.configProfile;
        });

        /**
         * Tab General
         */

        vm.saveBasicData = () => {
            profileFactory.update(_.pick(vm.profile, ['id', 'name', 'description'])).then(() => {
                vm.basicDataForm.$setPristine();
                $mdToast.showSimple('El perfil fue actualizado.');
            }, err => {
                vm.basicDataForm.$setPristine();
                $mdToast.showSimple('Ha ocurrido un error actualizando el perfil');
            });
        };

        vm.changePermissions = ($event, moduleItem) => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/profile/profileDetails/dialog.permissionSelector.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.moduleItem);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    moduleItem: angular.copy(moduleItem)
                }
            }).then(moduleItemUpdated => {
                moduleItem.config.privileges = moduleItemUpdated.config.privileges;
                $mdToast.showSimple('Privilegios actualizados');
            });
        };

        vm.switchModule = (module) => {
            let initValue = module.config.privileges.read;
            for (let key in module.config.privileges) {
                module.config.privileges[key] = !initValue;
            }
        };

        vm.onDelete = () => window.location.href = '#/perfiles';

        /**
         * Obtener lista de funcionarios
         */
        vm.searchText = '';
        vm.limit = 20;
        vm.page = 0;

        vm.nextPageEmployeeList = () => new Promise((resolve, reject) => {
            vm.page++;
            profileFactory.getEmployeeList(vm.idProfile, vm.searchText, vm.limit, vm.page).then(
                employeeListObj => {
                    vm.employeeList = (vm.employeeList || []).concat(employeeListObj.employeeList);
                    vm.employeeListCount = employeeListObj.employeeListCount;
                    $scope.$apply();
                    _.isEmpty(employeeListObj.employeeList) ? reject() : resolve();
                },
                err => {
                    reject();
                    console.log(err);
                }
            );
        });

        vm.onEmployeeSearchTextChange = () => {
            vm.page = 0;
            vm.employeeList = null;
            vm.nextPageEmployeeList().then(() => { }, () => { });
        };

        vm.nextPageEmployeeList().then(() => { }, () => { });

        vm.employeeFields = {
            job: true,
            establishment: true
        };

        vm.savePrivileges = () => {

            /**
             * 
             * Método para mapear permisos de un perfil antes de guardar en BD
             * Recibe un objeto "moduleList" y lo recorre para limpiar módulos sin permisos
             * 
             */
            let mapModules = (moduleList) => {
                let tmpModuleList = {};
                for (let moduleName in moduleList) {
                    let moduleItem = moduleList[moduleName];
                    if (_.some(moduleItem.config.privileges)) {
                        tmpModuleList[moduleName] = {
                            config: {
                                privileges: _.omit(moduleItem.config.privileges, false)
                            },
                            modules: _.isEmpty(moduleItem.modules) ? {} : mapModules(moduleItem.modules)
                        };
                    }
                }
                return tmpModuleList;
            };

            profileFactory.update({
                id: vm.idProfile,
                profiles: mapModules(vm.configProfile.profiles)
            }).then(() => {
                $mdToast.showSimple('Los permisos del perfil fueron actualizados');
            }, () => {
                $mdToast.showSimple('Ha ocurrido un error actualizando los permisos del perfil');
            });
        };

        vm.showDialogEmployeeManager = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/profile/profileDetails/dialog.employeeListManager.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide({
                        idEmployeeList: _.map(vm.employeeList, 'id')
                    });

                    vm.employeeList = [];

                    vm.addEmployee = employeeSelected => vm.employeeList.unshift(employeeSelected);
                    vm.removeEmployee = employee => _.remove(vm.employeeList, { id: employee.id });
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then(idList => {
                $mdToast.showSimple('Asignando funcionarios al listado...');
                profileFactory.addEmployeeList(vm.idProfile, idList).then(() => {
                    vm.onEmployeeSearchTextChange();
                    $mdToast.showSimple('El perfil fue asignado a los funcionarios seleccionados');
                }, err => $mdToast.showSimple('Ha ocurrido un error asignando el perfil')
                );
            });
        };

        vm.showDialogUnitManager = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/profile/profileDetails/dialog.unitListManager.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide({
                        idUnitList: _.map(vm.unitList, 'id')
                    });

                    vm.unitList = [];

                    vm.addUnit = unit => vm.unitList.unshift(unit);
                    vm.removeUnit = unit => _.remove(vm.unitList, { id: unit.id });
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then(idList => {
                $mdToast.showSimple('Asignando funcionarios al listado...');
                profileFactory.addEmployeeList(vm.idProfile, idList).then(() => {
                    vm.onEmployeeSearchTextChange();
                    $mdToast.showSimple('El perfil fue asignado a los funcionarios seleccionados');
                }, err => $mdToast.showSimple('Ha ocurrido un error asignando el perfil')
                );
            });
        };


        vm.removeEmployee = (employee) => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: 'Quitar funcionario',
                    textContent: '¿Estás seguro de quitar a ' + employee.fullname + ' del listado?',
                    ok: 'Si, quitar funcionario',
                    cancel: 'Cancelar'
                })
            ).then(() => {
                employeeFactory.removeProfile(employee.id, vm.idProfile).then(() => {
                    _.remove(vm.employeeList, { id: employee.id });
                    $mdToast.showSimple('El funcionario ha sido quitado del listado');
                }, err => {
                    $mdToast.showSimple('Ha ocurrido un error quitando el funcionario');
                });
            });
        };

        vm.addAllEmployees = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: 'Agregar todos los funcionarios',
                    textContent: '¿Estás seguro de agregar todos los funcionarios al perfil?',
                    ok: 'Si, agregar',
                    cancel: 'Cancelar'
                })
            ).then(() => {
                $mdToast.showSimple('Agregando funcionarios, esta tarea podría tardar unos segundos...');
                profileFactory.addAllEmployees(vm.idProfile).then(() => {
                    vm.onEmployeeSearchTextChange();
                    $mdToast.showSimple('Se agregaron todos los funcionarios al perfil');
                }, err => {
                    $mdToast.showSimple('Ha ocurrido un error agregando a los funcionarios');
                });
            });
        };

        vm.removeAllEmployees = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: 'Quitar todos los funcionarios',
                    textContent: '¿Está seguro de quitar todos los funcionarios del perfil?',
                    ok: 'Si, quitar',
                    cancel: 'Cancelar'
                })
            ).then(() => {
                $mdToast.showSimple('Quitando funcionarios del perfil...');
                profileFactory.removeAllEmployees(vm.idProfile).then(() => {
                    vm.onEmployeeSearchTextChange();
                    $mdToast.showSimple('Se quitaron todos los funcionarios del perfil');
                }, err => {
                    $mdToast.showSimple('Ha ocurrido un error quitando los funcionarios');
                });
            });
        };
    }
})();