(function() {
    'use strict';
    /**
     * Example
     * <ssvq-storage-program-admin></ssvq-storage-program-admin>
     */
    app.directive('ssvqStorageProgramAdmin', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/program/programAdmin/programAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, programFactory) {
        let vm = this;
        window._vm = this;
        vm.showSearch = false;
        vm.showLoading = 0;
        vm.searchText = '';
        vm.program = null;
        vm.breadcrumbs = [];

        vm.reloadList = (program) => {
            // buscar si program existe en breadcrumbs
            // eliminar desde la posicion a la derecha
            let newBreadcrumbs = [];
            for (let i = 0; i < vm.breadcrumbs.length; ++i) {
                if (vm.breadcrumbs[i].id == program.id) {
                    vm.breadcrumbs = newBreadcrumbs;
                    break;
                }
                newBreadcrumbs.push(vm.breadcrumbs[i]);
            }

            vm.program = program;
            vm.childrenList = [];
            if (program) {
                // obtiene breadcrumbs
                if (vm.searchText > '') {
                    vm.searchText = '';
                    vm.showLoading++;
                    vm.showSearch = false;
                    vm.breadcrumbs = [];
                    programFactory.getBreadcrumbs({
                        id: vm.program.id
                    }).then(
                        response => {
                            vm.breadcrumbs = response.obj.programs;
                            vm.showLoading--;
                        }
                    );
                } else {
                    vm.breadcrumbs.push(program);
                }

                // obtener subprogramas
                vm.showLoading++;
                programFactory.getAll({
                    where: {
                        program: vm.program.id
                    }
                }).then(
                    response => {
                        vm.childrenList = response.obj.programs;
                        vm.showLoading--;
                    }
                );
            } else {
                // obtener programas
                vm.showLoading++;
                programFactory.getAll({
                        where: {
                            program: null
                        }
                    })
                    .then(response => {
                        vm.childrenList = response.obj.programs;
                        vm.showLoading--;
                    });
                vm.breadcrumbs = [];
            }
        };

        // Obtener lista de programas
        vm.reloadList(false);

        vm.addProgram = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/program/programAdmin/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.program = {
                        description: '',
                        active: true
                    };
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.program);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataCreate => {
                if (_.isEmpty(dataCreate)) {
                    return;
                }
                $mdToast.showSimple('Guardando programa...');

                // crear programa
                dataCreate.program = vm.program ? vm.program.id : null;
                programFactory.create(dataCreate).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha creado el programa');
                        $mdDialog.hide();
                        dataReturn.ok && vmParent.reloadList(vmParent.program, true);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo crear el programa')
                );
            });
        };

        vm.onEditItem = (program, $event) => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/program/programAdmin/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.program = angular.copy(program);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.program);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando programa...');

                // guardar subprograma
                programFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdDialog.hide();
                        $mdToast.showSimple('Se ha modificado el programa');
                        if (dataReturn.ok) {
                            let i = vmParent.breadcrumbs.length - 1;
                            if (i >= 0 && vmParent.breadcrumbs[i].id == dataReturn.obj.program.id) {
                                vmParent.program = dataReturn.obj.program;
                                vmParent.breadcrumbs[i] = dataReturn.obj.program;
                            } else {
                                vmParent.reloadList(vmParent.program, true);
                            }
                        }
                    },
                    // fail
                    err => $mdToast.showSimple(
                        'No se pudo modificar el programa. ' + (err.raw.message || '')
                    )
                );
            });
        };

        vm.onDeleteItem = (program, $event) => {
            let vmParent = vm;
            let message = $translate.instant('PROGRAM.DIALOG.DELETE_MESSAGE') +
                ' ' + program.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('PROGRAM.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('PROGRAM.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('PROGRAM.DIALOG.TITLE'))
                .cancel($translate.instant('PROGRAM.DIALOG.CANCEL'))
            ).then(
                function() {
                    // eliminar subprograma
                    programFactory.delete(program.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado el programa ' +
                                response.obj.program.description);
                            response.ok && vmParent.reloadList(vmParent.program, true);
                        },
                        // fail
                        err => $mdToast.showSimple(
                            'Hubo un problema al eliminar. ' + (err.message || '')
                        )
                    );
                },
                function() {
                    console.log(vm, $scope);
                } // cancelo
            );
        };

        $scope.$watch('vm.searchText', searchText => {
            if (searchText > '') {
                vm.breadcrumbs = [];
                vm.searchText = searchText;
                vm.program = null;
                programFactory.getAll({
                    filter: searchText
                }).then(
                    response => vm.childrenList = response.obj.programs
                );
            } else {
                vm.showSearch = false;
            }
        });
    }
})();