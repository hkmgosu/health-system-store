(function () {
    'use strict';
    /**
     * Example
     * <ssvq-area-maintainer></ssvq-area-maintainer>
     */
    app.directive('ssvqAreaMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/areaMaintainer/areaMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $timeout, leafletData, $translate, $mdDialog, $mdToast, areaFactory) {
        var vm = this;

        vm.tmpLayer = undefined;

        vm.layerSelected = undefined;
        vm.areaSelected = undefined;
        vm.areaSelectedTmp = undefined;

        /**
         * Permite eliminar una geo referencia completamente
         * @param {type} geo
         * @returns {undefined}
         */
        $scope.delete = function (area) {
            //if ($scope.areaSelected.editing) {
            var confirm = $mdDialog.confirm()
                .title($translate.instant('AREA.CONFIRMDELETEDIALOG.TITLE'))
                .textContent($translate.instant('AREA.CONFIRMDELETEDIALOG.TEXT'))
                .ariaLabel($translate.instant('AREA.CONFIRMDELETEDIALOG.PLACE'))
                .ok($translate.instant('AREA.CONFIRMDELETEDIALOG.OK'))
                .cancel($translate.instant('AREA.CONFIRMDELETEDIALOG.CANCEL'));
            $mdDialog.show(confirm).then(function (result) {
                io.socket.get('/area/delete', { id: area.data.id }, function (data) {
                    if (data) {
                        if (data.reload) {
                            location.reload();
                        }
                        var index = $scope.areas.indexOf(area);
                        $scope.areas.splice(index, 1);
                        $scope.areaSelected = undefined;
                        $scope.$apply();
                    }
                    $mdToast.showSimple($translate.instant(data.msg));
                });
            }, function () { });
            //}

        };

        $scope.customColors = ['#E74C3C', '#9B59B6', '#2980B9', '#1ABC9C', '#27AE60', '#F1C40F', '#D35400', '#BDC3C7', '#34495E'];

        let onPolyClick = (e) => {
            let poly = e.target;
            if (!vm.areaSelected) {
                vm.selectArea(_.find(vm.areaList, { id: poly.options.id }));
            }
        };

        // Método transforma objeto de área en un polígono leaflet
        let modelToPolygon = area => {
            let poly = L.polygon(area.geometry.coordinates[0].map(coordinates => L.latLng(coordinates[1], coordinates[0])), {
                id: area.id,
                color: area.color,
                weight: 2,
                label: "<p>" + area.name + "</p>",
                isArea: true
            });
            poly.on('click', onPolyClick);
            return poly;
        };

        // Ajustar bordes del mapa con áreas visibles
        let fitBoundsGeneral = (map) => {
            map.fitBounds(L.featureGroup(_.filter(map._layers, layer => (layer.options && layer.options.isArea))).getBounds().pad(0.005));
        };

        let createDrawer;

        areaFactory.getAll().then(areaList => {
            vm.areaList = areaList;
            leafletData.getMap().then(function (map) {
                areaList.forEach(area => {
                    area.visible = true;
                    map.addLayer(modelToPolygon(area))
                });

                fitBoundsGeneral(map);
            });
        });

        /**
         * Definición del mapa
         */
        vm.map = {
            defaults: {
                scrollWheelZoom: false,
                maxZoom: 18,
                minZoom: 3,
                controls: {
                    layers: {
                        visible: false
                    }
                }
            },
            center: {
                lng: -71.4504254,
                lat: -33.0474181,
                zoom: 10
            },
            layers: {
                baselayers: {
                    osm: {
                        name: 'Mapa',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz'
                    }
                },
                overlays: {}
            },
            events: {
                path: {
                    enable: ['click']
                }
            }
        };

        vm.toggleVisibility = area => {
            area.visible = !area.visible;

            leafletData.getMap().then(function (map) {
                if (area.visible) {
                    map.addLayer(modelToPolygon(area));
                } else {
                    map.removeLayer(_.find(map._layers, layer => (layer.options && (layer.options.id === area.id))));
                }
                fitBoundsGeneral(map);
            });
        };

        leafletData.getMap().then(function (map) {
            map.editable = true;
        });

        vm.selectArea = (area = { visible: true, color: '#000000' }) => {
            // Creación de nueva área o polígono
            if (_.isEmpty(area.geometry)) {
                leafletData.getMap().then(function (map) {
                    if (_.isEmpty(createDrawer)) {
                        // Primera definición de capa para creación de polígonos
                        createDrawer = new L.Draw.Polygon(map, {
                            allowIntersection: false,
                            drawError: {
                                color: '#e1e100'
                            },
                            shapeOptions: {
                                color: (area.color)
                            },
                            color: (area.color)
                        });
                        // Captura de evento, finalización de creación de polígonos
                        map.on('draw:created', function (e) {
                            var eventLayer = angular.copy(e.layer);
                            // Deshabilitar capa de creación de polígonos
                            createDrawer.disable();
                            // Habilitar capa de edición de polígonos
                            vm.layerSelected = new L.Polygon(eventLayer.getLatLngs(), {
                                color: area.color
                            });
                            vm.layerSelected.editing.enable();
                            map.addLayer(vm.layerSelected);
                            map.fitBounds(vm.layerSelected.getBounds().pad(0.1), {
                                maxZoom: 18
                            });
                        });
                        // Captura de evento, cancelación de creación de polígonos
                        map.on('draw:canceled', function (e) {
                            $mdDialog.show(
                                $mdDialog.confirm({
                                    title: 'Cancelación de creación',
                                    textContent: '¿Está seguro de cancelar la creación del área?',
                                    ok: 'Si, cancelar',
                                    cancel: 'No'
                                })
                            ).then(() => {
                                vm.cancel();
                            }, () => {
                                createDrawer.enable();
                            });
                        });
                    }

                    // Habilitar la capa de creación de polígonos
                    createDrawer.enable();

                    // Guardar referencia de área
                    vm.areaSelected = area;
                });
            }
            // Edición de área o polígono existente
            else {
                leafletData.getMap().then(function (map) {
                    // Obtener referencia de capa que se está modificando
                    vm.layerSelected = _.find(map._layers, layer => layer.options.id === area.id);
                    // Habilitar edición en la capa seleccionada
                    vm.layerSelected.editing.enable();
                    // Ajustar bordes del mapa
                    map.fitBounds(vm.layerSelected.getBounds().pad(0.1), {
                        maxZoom: 18
                    });

                    // Guardar referencia de área
                    vm.areaSelected = area;
                    // Guardar referencia temporal
                    vm.areaSelectedTmp = angular.copy(area);
                });
            }
        };

        vm.cancel = () => {
            leafletData.getMap().then(function (map) {
                if (vm.areaSelected.id) {
                    // Asegurarse que la edición quedará deshabilitada
                    vm.layerSelected.editing.disable();
                    // Restaurar últimas coordenadas válidas
                    vm.layerSelected.setLatLngs(vm.areaSelected.geometry.coordinates[0].map(coordinates => L.latLng(coordinates[1], coordinates[0])));
                    // Restaurar último color válido
                    vm.layerSelected.setStyle({ color: vm.areaSelectedTmp.color });
                    // Restaurar datos de referencia
                    Object.assign(vm.areaSelected, vm.areaSelectedTmp);
                } else {
                    // Quitar capa del mapa
                    if (vm.layerSelected) { map.removeLayer(vm.layerSelected); }
                    // Asegurarse que la capa de creación quedará deshabilitada
                    if (createDrawer) { createDrawer.disable(); }
                }

                // Setear bordes de mapa con las áreas existentes
                fitBoundsGeneral(map);

                // Limpiar referencia de área seleccionada
                vm.areaSelected = undefined;
            });
        };

        $scope.$watch('vm.areaSelected.color', color => {
            if (!color) { return; }
            if (createDrawer && createDrawer.enabled()) {
                // TODO asignar color a capa de creación
                createDrawer.setOptions({ color: color });
                //createDrawer.options.shapeOptions.color = color;
            } else if (vm.layerSelected) {
                vm.layerSelected.setStyle({ color: color });
            }
        }, true);

        vm.confirmSave = (area) => {
            area.geometry = vm.layerSelected.toGeoJSON().geometry;
            areaFactory.save(area).then(areaSaved => {
                areaSaved.visible = true;
                if (!area.id) { vm.areaList.unshift(areaSaved); }
                // Guardar referencia temporal
                vm.areaSelectedTmp = angular.copy(areaSaved);
                $mdToast.showSimple('Se actualizó el área correctamente');
                vm.areaForm.$setPristine();
                vm.areaForm.$setUntouched();
            });
        };

        vm.customOptions = {
            size: 32,
            roundCorners: true
        };

        vm.customColors = ['#E74C3C', '#9B59B6', '#2980B9', '#1ABC9C', '#27AE60', '#F1C40F', '#D35400', '#BDC3C7', '#34495E'];
    }
})();