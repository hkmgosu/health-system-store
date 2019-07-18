(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-maintainer></ssvq-employee-maintainer>
     */
    app.directive('ssvqEmployeeMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employeeMaintainer/employeeMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, employeeFactory) {
        var vm = this;
        vm.viewMode = 'list';
        vm.paginate = { page: 0, limit: 15 };
        vm.employeeList = null;
        angular.extend($scope, {
            searchText: '',
            showSaveDialog: function ($event) {
                $mdDialog.show({
                    targetEvent: $event,
                    clickOutsideToClose: true,
                    templateUrl: '/components/employee/employeeMaintainer/dialog.save.tmpl.html',
                    controller: function DialogController($scope, $mdDialog, employeeFactory) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.employee);

                        vm.genderList = [{
                            text: 'Masculino',
                            code: 'male'
                        }, {
                            text: 'Femenino',
                            code: 'female'
                        }];

                        vm.syncFromApi = () => {
                            vm.sync = true;
                            employeeFactory.syncFromApi(vm.employee.rut).then(employee => {
                                employee.birthdate = employee.birthdate ? new Date(employee.birthdate) : null;
                                Object.assign(vm.employee, employee);
                                vm.sync = false;
                                $scope.$apply();
                            });
                        };
                    },
                    bindToController: true,
                    controllerAs: 'vm'
                }).then(employee => {
                    if (_.isEmpty(employee)) { return; }
                    $mdToast.showSimple('Creando funcionario...');
                    employeeFactory.create(employee).then(employeeCreated => {
                        $mdToast.showSimple('Se ha creado el funcionario');
                        window.location.href = '#/funcionarios/detalles/' + employeeCreated.id;
                    }, () => $mdToast.showSimple('No se pudo crear el funcionario'));
                });
            }
        });

        vm.getAfp = id => (_.find(vm.parametricObj.afps, { id: id }) || {}).name;
        vm.getHealthcare = id => (_.find(vm.parametricObj.healthcares, { id: id }) || {}).name;
        vm.getLegalQuality = id => (_.find(vm.parametricObj.legalQualities, { id: id }) || {}).name;
        vm.getPlant = id => (_.find(vm.parametricObj.plants, { id: id }) || {}).name;

        vm.fields = {
            job: true,
            contact: true
        };

        /**
         * Obtener paramétricas
         */
        employeeFactory.getParams().then(parametricObj => vm.parametricObj = parametricObj);

        vm.viewDetails = employee => {
            window.location.href = '#/funcionarios/detalles/' + employee.id;
        };

        vm.nextPage = () => new Promise((resolve, reject) => {
            vm.paginate.page += 1;
            employeeFactory.getList({
                filter: $scope.searchText,
                paginate: vm.paginate
            }, true).then(data => {
                vm.employeeList = (vm.employeeList || []).concat(data.list);
                vm.total = data.total;
                resolve();
            }, () => {
                vm.employeeList = [];
                reject();
            });
        });

        vm.onTablePaginate = () => {
            vm.paginate.page--;
            vm.employeeList = null;
            vm.total = 0;
            vm.nextPage().then(() => { }, () => { });
        };

        $scope.$watch('searchText', searchText => {
            vm.paginate.page = 0;
            vm.employeeList = null;
            vm.total = 0;
            vm.nextPage().then(() => { }, () => { });
        }, true);

        vm.onDelete = idEmployee => _.remove(vm.employeeList, { id: idEmployee });
    }
})();