(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-detail-sidebar key=""></ssvq-request-detail-sidebar>
     */
    app.directive('ssvqRequestDetailSidebar', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                userTypes: '=',
                requestId: '=',
                unitAssigned: '=',
                employeeAssigned: '=',
                label: '=',
                dueDate: '=',
                stakeholders: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestDetailSidebar/requestDetailSidebar.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $mdDialog, $translate, $location, requestFactory, requestStakeholdersFactory, $stateParams) {
        var vm = this;
        vm.dueDate = vm.dueDate ? new Date(vm.dueDate) : null;
        vm.idRequest = $stateParams.id;

        let allStakeholders = [];
        let validateStakeholders = stakeholders => {
            vm.visibleStakeholders = _.uniqBy(stakeholders, (obj) => {
                return obj.employee.id;
            });
            vm.subscribed = !!(_.find(stakeholders, function (stakeholder) {
                return (stakeholder.employee.id === employee.id) && stakeholder.subscribed;
            }));
        };

        angular.merge(vm, {
            /* Variables */
            tmp: {},
            editing: null, // unit|employee|label|dueDate
            labels: [],
            now: new Date(),
            minLength: 0, //employee-autocomplete
            /* Métodos*/
            setUnitAssigned: function (comment) {
                requestFactory
                    .setUnitAssigned(vm.idRequest, vm.tmp.unitAssigned, comment, vm.unitAssigned)
                    .then(() => {
                        $mdDialog.hide();
                        $mdToast.showSimple($translate.instant('REQUEST.SUCCESS.UPDATE.UNIT_ASSIGNED'));
                        $location.path('solicitudes');
                    }, err => {
                        vm.tmp.unitAssigned = angular.copy(vm.unitAssigned);
                        $mdToast.showSimple($translate.instant('REQUEST.ERROR.UPDATE'));
                    });
            },
            setEmployeeAssigned: (comment, maintainAsStakeholder) => {
                requestFactory
                    .setEmployeeAssigned(vm.idRequest, vm.tmp.employeeAssigned, vm.employeeAssigned, maintainAsStakeholder, comment)
                    .then(() => {
                        $mdDialog.hide();
                        vm.employeeAssigned = angular.copy(vm.tmp.employeeAssigned);
                        $mdToast.showSimple($translate.instant('REQUEST.SUCCESS.UPDATE.EMPLOYEE_ASSIGNED'));
                        vm.editing = null;
                    }, err => {
                        vm.tmp.employeeAssigned = angular.copy(vm.employeeAssigned);
                        $mdToast.showSimple($translate.instant('REQUEST.ERROR.UPDATE'));
                    });
            },
            setLabel: () => {
                requestFactory.setLabel(vm.idRequest, vm.tmp.label)
                    .then(() => {
                        vm.label = vm.tmp.label;
                        $mdToast.showSimple($translate.instant('REQUEST.SUCCESS.UPDATE.LABEL'));
                        vm.editing = null;
                    }, err => {
                        vm.tmp.label = vm.label;
                        $mdToast.showSimple($translate.instant('REQUEST.ERROR.UPDATE'));
                    });
            },
            setDueDate: () => {
                requestFactory.setDueDate(vm.idRequest, vm.tmp.dueDate)
                    .then(() => {
                        vm.dueDate = vm.tmp.dueDate;
                        $mdToast.showSimple($translate.instant('REQUEST.SUCCESS.UPDATE.DUEDATE'));
                        vm.editing = null;
                    }, err => {
                        vm.tmp.dueDate = vm.dueDate;
                        $mdToast.showSimple($translate.instant('REQUEST.ERROR.UPDATE'));
                    });
            },
            confirmSetEmployeeAssigned: function ($event, confirm) {
                if (vm.tmp.employeeAssigned && vm.employeeAssigned && (vm.tmp.employeeAssigned.id === vm.employeeAssigned.id)) {
                    return console.log('No hay modificaciones para guardar');
                }
                if (confirm) {
                    $mdDialog.show({
                        targetEvent: $event,
                        clickOutsideToClose: true,
                        templateUrl: '/components/request/requestDetailSidebar/dialog.confirm.employee-assignment.tmpl.html',
                        controller:
                            /* @ngInject */
                            function DialogController($mdDialog, confirm, oldValue, newValue) {
                                var vm = this;
                                vm.close = function () {
                                    $mdDialog.hide();
                                };
                                vm.oldValue = oldValue;
                                vm.newValue = newValue;
                                vm.confirm = confirm;
                            },
                        controllerAs: 'vm',
                        locals: {
                            oldValue: vm.employeeAssigned,
                            newValue: vm.tmp.employeeAssigned,
                            confirm: vm.setEmployeeAssigned
                        }
                    });
                } else {
                    vm.employeeAssigned = vm.tmp.employeeAssigned;
                }
            },
            confirmSetUnitAssigned: function () {
                if (confirm) {
                    if (vm.tmp.unitAssigned.id === vm.unitAssigned.id) {
                        return $mdToast.showSimple('La unidad no ha cambiado');
                    }
                    $mdDialog.show({
                        clickOutsideToClose: true,
                        templateUrl: '/components/request/requestDetailSidebar/dialog.confirm.unit-assignment.tmpl.html',
                        controller:
                            /* @ngInject */
                            function DialogController($mdDialog, confirm, oldValue, newValue) {
                                var vm = this;
                                vm.close = function () {
                                    $mdDialog.hide();
                                };
                                vm.oldValue = oldValue;
                                vm.newValue = newValue;
                                vm.confirm = confirm;
                            },
                        controllerAs: 'vm',
                        locals: {
                            oldValue: vm.unitAssigned,
                            newValue: vm.tmp.unitAssigned,
                            confirm: vm.setUnitAssigned
                        }
                    });
                } else {
                    vm.unitAssigned = vm.tmp.unitAssigned;
                    vm.opts.unitAssigned.edit = false;
                }
            },
        });

        /**
         * Obtener labels de requests
         */
        requestFactory.getLabels().then(
            labels => vm.labels = labels || [],
            err => vm.labels = []
        );

        var socketRequest = function (event) {
            if (event.id == vm.idRequest) {
                var data = event.data.data;
                switch (event.data.message) {
                    case 'request:new-employeeAssigned':
                        vm.employeeAssigned = data.assignedTo;
                        break;
                    case 'request:new-unitAssigned':
                        vm.unitAssigned = data.assignedTo;
                        vm.employeeAssigned = null;
                        break;
                    case 'request:new-dueDate':
                        vm.dueDate = data.dueDate;
                        break;
                    case 'request:new-label':
                        vm.label = data.label;
                        break;
                    case 'request:stakeholder-updated':
                        _.extend(_.find(allStakeholders, { id: data.id }), data);
                        validateStakeholders(allStakeholders);
                        break;
                    case 'request:stakeholder-added':
                        if (!_.find(allStakeholders, { id: data.id })) {
                            allStakeholders.push(data);
                            validateStakeholders(allStakeholders);
                        } else {
                            _.extend(_.find(allStakeholders, { id: data.id }), data);
                            validateStakeholders(allStakeholders);
                        }
                        break;
                    case 'request:stakeholder-removed':
                        _.remove(allStakeholders, { id: data.id });
                        validateStakeholders(allStakeholders);
                        break;
                    default:
                        console.warn('Unrecognized socket event (`%s`) from server:', event.verb, event);
                }
                $scope.$apply();
            }
        };
        io.socket.on('request', socketRequest);
        $scope.$on("$destroy", function () {
            io.socket.off('request', socketRequest);
            $(document).unbind('keyup.requestSidebar');
        });

        $(document).on('keyup.requestSidebar', e => {
            if (e.keyCode === 27) {
                vm.editing = null;
                $scope.$apply();
            }
        });
        vm.editStakeholders = function ($event) {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/request/requestDetailSidebar/dialog.stakeholders.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.close = function () {
                            $mdDialog.hide();
                        };
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    request: vm.idRequest,
                    stakeholders: allStakeholders
                }
            });
        };

        vm.setSubscribed = function (subscribed) {
            requestStakeholdersFactory
                .setSubscribed({
                    request: vm.idRequest,
                    subscribed: subscribed
                })
                .then(function (res) {
                    if (res.ok) {
                        vm.subscribed = subscribed;
                        if (subscribed) {
                            $mdToast.showSimple('Te has suscrito a las notificaciones de esta solicitud');
                        } else {
                            $mdToast.showSimple('No recibirás más notificaciones de esta solicitud');
                        }
                    } else {
                        console.error('-.-');
                    }
                }, function (err) {
                    console.error(err);
                });
        };

        requestStakeholdersFactory
            .get({ request: vm.idRequest })
            .then(function (response) {
                if (response.ok) {
                    allStakeholders = response.obj;
                    validateStakeholders(allStakeholders);
                }
            }, function (err) {
                console.error('requestStakeholdersFactory - Error Get' + err);
            });

        $scope.$watch(
            () => vm.editing,
            editing => {
                vm.tmp.dueDate = angular.copy(vm.dueDate);
                vm.tmp.label = angular.copy(vm.label);
                vm.tmp.employeeAssigned = angular.copy(vm.employeeAssigned);
                vm.tmp.unitAssigned = angular.copy(vm.unitAssigned);
            }
        );

        $scope.$watch('vm.userTypes', userTypes => {
            if (!userTypes) { return; }
            vm.opts = {
                unitAssigned: {
                    editable: vm.userTypes && vm.userTypes.indexOf('supervisor') !== -1
                },
                employeeAssigned: {
                    editable: vm.userTypes && vm.userTypes.indexOf('supervisor') !== -1
                },
                label: {
                    editable: vm.userTypes && (vm.userTypes.indexOf('owner') !== -1 || vm.userTypes.indexOf('supervisor') !== -1)
                },
                dueDate: {
                    editable: vm.userTypes && (vm.userTypes.indexOf('owner') !== -1 || vm.userTypes.indexOf('supervisor') !== -1)
                }
            }
        });

    }
})();