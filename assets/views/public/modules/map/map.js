(function () {
    'use strict';
    /**
     * Example
     * <ssvq-public-map></ssvq-public-map>
     */
    app.directive('ssvqPublicMap', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: true,
            restrict: 'E',
            scope: {},
            templateUrl: '/views/public/modules/map/map.tmpl.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast) {
        var vm = this;

        var publicMap = L.map('ssvqMap', {
            scrollWheelZoom: false,
            maxZoom: 18,
            minZoom: 3
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(publicMap);

        var establishmentMarkerList = L.markerClusterGroup({
            disableClusteringAtZoom: 16
        });

        publicMap.addLayer(establishmentMarkerList);

        io.socket.post('/area/getAllPublic', function (data) {
            if (!data.ok) { return; }
            data.obj.forEach(area => {
                L.polygon(area.geometry.coordinates[0].map(coordinates => L.latLng(coordinates[1], coordinates[0])), {
                    id: area.id,
                    color: area.color,
                    weight: 2,
                    label: "<p>" + area.name + "</p>"
                }).addTo(publicMap);
            });
        });

        vm.updateBounds = () => {
            if (_.isEmpty(establishmentMarkerList.getLayers())) { return; }
            publicMap.fitBounds(establishmentMarkerList.getBounds().pad(0.005));
        };

        vm.viewDetails = function (selected) {
            // Centrar mapa con posición del establecimiento
            if (selected.position) {
                publicMap.setView(L.latLng(selected.position.coordinates[1], selected.position.coordinates[0]), 15);
            }
            vm.establishmentSelected = angular.copy(selected);
            if (vm.establishmentSelected.website && (vm.establishmentSelected.website.indexOf('http') === -1)) {
                vm.establishmentSelected.website = 'http://' + vm.establishmentSelected.website;
            }

            $mdToast.showSimple('Mostrando detalles de establecimiento');
        };

        /**
         * Cerrar panel de establecimiento
         */
        vm.closeEstablishmentDetails = () => {
            vm.establishmentSelected = null;
            vm.updateBounds();
        };

        $scope.$on('establishments/get', function (e, data) {
            vm.establishmentList = data.establishmentList;
            establishmentMarkerList.clearLayers();

            // Agregar marcadores al mapa
            vm.establishmentList.forEach(establishment => {
                if (!_.isEmpty(establishment.address) && !_.isEmpty(establishment.address.position)) {
                    let marker = L.marker(L.latLng(establishment.address.position.coordinates[1], establishment.address.position.coordinates[0]), {
                        id: establishment.id,
                        icon: L.icon({
                            iconUrl: '/establishmentType/iconPublic?id=' + establishment.type,
                            iconSize: [45, 45]
                        })
                    });
                    marker.on('click', (e) => {
                        vm.viewDetails(_.find(vm.establishmentList, { id: e.target.options.id }));
                    });
                    establishmentMarkerList.addLayer(marker);
                }
            });
            vm.updateBounds();
        });
        $scope.$on('establishment/focus', function (e, establishment) {
            vm.viewDetails(establishment);
        });
    }
})();