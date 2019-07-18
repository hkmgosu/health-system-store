(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-account></ssvq-employee-account>
     */
    app.directive('ssvqEmployeeAccount', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employeeAccount/employeeAccount.html'
        };
    });

    /* @ngInject */
    function ComponentController(employeeFactory, $mdToast, $resourceFactory) {
        var vm = this;

        employeeFactory
            .getProfile()
            .then((employee) => {
                vm.employee = employee;
                vm.employeePersonalData = _.pick(employee, [
                    'name',
                    'lastname',
                    'mlastname',
                    'email',
                    'personalEmail',
                    'annexe'
                ]);
            });

        vm.updatePersonalData = () => {
            vm.employeePersonalData.email = vm.employeePersonalData.email || null;
            employeeFactory
                .updatePersonalData(vm.employeePersonalData)
                .then(() => {
                    _.extend(vm.employee, vm.employeePersonalData);
                    vm.personalDataForm.$setPristine();
                    vm.personalDataForm.$setUntouched();
                    $mdToast.showSimple('Tus datos personales se actualizaron correctamente');
                })
                .catch((err) => {
                    $mdToast.showSimple('Ha ocurrido un error actualizando tus datos personales');
                });
        };

        vm.updatePasswordData = () => {
            employeeFactory
                .updatePasswordData(vm.employeePasswordData)
                .then(() => {
                    vm.employeePasswordData = {};
                    vm.passwordDataForm.$setPristine();
                    vm.passwordDataForm.$setUntouched();
                    $mdToast.showSimple('Tu contraseña se actualizó correctamente');
                })
                .catch((err) => {
                    $mdToast.showSimple('Ha ocurrido un error actualizando tu contraseña');
                });
        };

        employeeFactory.getSharedFiles().then(response => {
            if (response.ok) {
                response.obj.forEach(function (element) {
                    element.class = AppUtils.mapType(element.type || element.mimeType);
                    element.sizeHuman = AppUtils.toHumanSize(element.size);
                }, this);
                vm.sharedFiles = response.obj;
            } else {
                vm.sharedFiles = [];
            }
        });

        vm.downloadFile = (fileId) => {
            var pathFile = '/archive/attachmentByOwner?id=' + fileId;
            window.location.href = pathFile;
        };

        $resourceFactory.getMyEmployeeResourceList().then(
            employeeResourceList => vm.employeeResourceList = employeeResourceList,
            err => console.log('err')
        );

    }
})();