(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-unit-product-request-admin></ssvq-storage-unit-product-request-admin>
     */
    app.directive('ssvqStorageUnitProductRequestAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/unitProductRequest/unitProductRequestAdmin/unitProductRequestAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdToast, unitProductRequestFactory, unitProductsManagerFactory) {
        var vm = this;
        vm.unitSelected = null;
        vm.units = [];
        vm.employeeUnits = [];
        vm.employee = null;
        vm.fields = {
            fullname: true,
            job: true,
            establishment: true,
            contact: true
        };

        // requerido para imagen de producto
        vm.timestamp = product => moment((product || {}).updatedAt).format('X');

        unitProductsManagerFactory.getStorages()
            .then(obj => vm.units = obj.units)
            .catch(err => $mdToast.showSimple('Error al buscar bodegas.' + (console.error(err) || '')));

        vm.onSelectEmployee = employee => {
            vm.employee = employee;
            unitProductRequestFactory.getAll({
                    where: {
                        employee: vm.employee.id
                    }
                })
                .then(res => vm.employeeUnits = res.obj.unitProductRequests)
                .catch(err => $mdToast.showSimple('Error al buscar bodegas del empleado.' + (console.error(err) || '')));
        };

        vm.onSelectUnit = () => {
            for (let i = 0; i < vm.employeeUnits.length; ++i) {
                if (vm.unitSelected == vm.employeeUnits[i].unit.id) {
                    return vm.unitSelected = null;
                }
            }

            unitProductRequestFactory.create({
                    employee: vm.employee.id,
                    unit: vm.unitSelected
                }).then(res => {
                    vm.employeeUnits.push(res.obj.unitProductRequest)
                    vm.unitSelected = null;
                    $mdToast.showSimple('Bodega asociada al empleado.');
                })
                .catch(err => $mdToast.showSimple('Error al asociar bodega al empleado.' + (console.error(err) || '')));
        };

        vm.delete = (id, $index) => {
            unitProductRequestFactory.delete(id)
                .then(res => {
                    vm.employeeUnits.splice($index, 1);
                    $mdToast.showSimple('Bodega quitada del empleado.');
                })
                .catch(err => $mdToast.showSimple('Error al eliminar bodega del empleado.' + (console.error(err) || '')));
        };

        vm.clean = () => {
            vm.unitSelected = null;
            vm.employee = null;
            vm.employeeUnits = [];
        };
    }
})();