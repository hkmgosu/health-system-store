(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-loction-admin></ssvq-storage-loction-admin>
     */
    app.directive('ssvqStorageLocationAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/location/locationAdmin/locationAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdToast, $mdDialog, locationFactory, unitProductsManagerFactory) {
        var vm = this;
        vm.description = null;
        vm.unitSelected = null;
        vm.units = [];
        vm.locations = [];

        // requerido para imagen de producto
        vm.timestamp = product => moment((product || {}).updatedAt).format('X');

        unitProductsManagerFactory.getStorages()
            .then(obj => vm.units = obj.units)
            .catch(err => $mdToast.showSimple('Error al buscar bodegas.' + (console.error(err) || '')));

        vm.onSelectUnit = () => {
            locationFactory.getAll({
                    where: {
                        unit: vm.unitSelected
                    }
                })
                .then(res => vm.locations = res.obj.locations)
                .catch(err => $mdToast.showSimple('Error al buscar ubicaciones de la bodega.' + (console.error(err) || '')));
        };

        vm.create = ($event) => {
            let confirm = $mdDialog.prompt()
                .title('Nueva Ubicación')
                .placeholder('Descripción')
                .ariaLabel('Descripción')
                .initialValue(null)
                .targetEvent($event)
                .required(true)
                .ok('Guardar')
                .cancel('Cerrar');

            $mdDialog.show(confirm)
                .then(function(result) {
                    locationFactory.create({
                            unit: vm.unitSelected,
                            description: result
                        }).then(res => {
                            vm.locations.push(res.obj.location);
                            $mdToast.showSimple('Se ha creado la ubicación.');
                        })
                        .catch(err => $mdToast.showSimple('Error al crear ubicación.' + (console.error(err) || '')));
                });
        };

        vm.edit = ($event, $index) => {
            let item = vm.locations[$index];
            let confirm = $mdDialog.prompt()
                .title('Editar Ubicación')
                .placeholder('Descripción')
                .ariaLabel('Descripción')
                .initialValue(item.description)
                .targetEvent($event)
                .required(true)
                .ok('Guardar')
                .cancel('Cerrar');

            $mdDialog.show(confirm)
                .then(function(result) {
                    locationFactory.update({
                            id: item.id,
                            description: result
                        }).then(res => {
                            vm.locations.splice($index, 1, res.obj.location);
                            $mdToast.showSimple('Se ha modificado la ubicación.');
                        })
                        .catch(err => $mdToast.showSimple('Error al modificar ubicación.' + (console.error(err) || '')));
                });
        };

        vm.delete = (id, $index) => {
            locationFactory.delete(id)
                .then(res => {
                    vm.locations.splice($index, 1);
                    $mdToast.showSimple('Ubicación eliminada.');
                })
                .catch(err => {
                    if (err.raw && err.raw.message) return $mdToast.showSimple(err.raw.message);
                    $mdToast.showSimple('Error al eliminar ubicación.' + (console.error(err) || ''));
                });
        };

        vm.clean = () => {
            vm.unitSelected = null;
            vm.description = null;
            vm.locations = [];
        };
    }
})();