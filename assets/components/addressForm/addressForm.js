(function () {
    'use strict';
    /**
     * Example
     * <ssvq-address-form></ssvq-address-form>
     */
    app.directive('ssvqAddressForm', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                address: '=',
                onSave: '&?',
                opts: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/addressForm/addressForm.html'
        };
    });

    /* @ngInject */
    function ComponentController($q, $scope, regionFactory, communeFactory, addressFactory) {
        var vm = this;

        vm.address = _.isObject(vm.address) ? vm.address : {
            state: 6
        };

        regionFactory.getAll()
            .then((response) => {
                if (response.ok) {
                    vm.regions = response.obj.region;
                } else {
                    vm.regions = [];
                }
            }, (err) => console.log(err));

        var defaultCenter = {
            lng: -71.4504254,
            lat: -33.0474181,
            zoom: 10
        };

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
            maxBounds: {
                northEast: {
                    lng: -134.28314,
                    lat: 1.39032
                },
                southWest: {
                    lng: -16.86127,
                    lat: -65.07879
                }
            }
        };

        vm.backPosition = () => {
            Object.assign(vm.map.center, {
                lat: vm.address.position.coordinates[1],
                lng: vm.address.position.coordinates[0]
            });
            vm.positionConfirmed = true;
        };
        vm.confirmPosition = () => {
            vm.positionConfirmed = true;
            vm.address.position = {
                type: 'Point',
                coordinates: [vm.map.center.lng, vm.map.center.lat]
            };
            vm.addressDataForm.$setDirty();
        };

        $scope.search = address => new Promise((resolve, reject) => {
            addressFactory.getAddressAutocomplete(address, vm.map.bounds).then(resolve, reject);
        });

        vm.selectItem = item => {
            if (_.isEmpty(item)) { return; }
            vm.positionConfirmed = true;
            Object.assign(vm.map.center, {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                zoom: 16
            });

            vm.address.position = {
                type: 'Point',
                coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
            };

            communeFactory.get(item.address.city).then(commune => {
                if (vm.address.state !== commune.region) {
                    communeFactory.getAll(commune.region).then((response) => {
                        if (response.ok) {
                            vm.communes = response.obj.commune;
                        } else {
                            vm.communes = [];
                        }
                    });
                }
                vm.address.state = commune.region;
                vm.address.district = commune.id;
            });
        };

        vm.onRegionChange = () => vm.address.district = null;

        $scope.$watch('vm.address.state', state => {
            if (!state) { return; }
            communeFactory.getAll(state).then(
                list => vm.communes = list,
                () => vm.communes = []
            );
        });

        if (navigator.share === undefined) {
            vm.shareIcon = 'open-in-new';
        } else {
            vm.shareIcon = 'share';
        }
        vm.sharePosition = () => {
            let url = 'https://www.google.com/maps/search/?api=1&query=' + vm.address.position.coordinates[1] + ',' + vm.address.position.coordinates[0];
            if (navigator.share) {
                navigator.share({
                    title: 'Ubicación',
                    text: 'Te envío una ubicación a través de MISSVQ',
                    url: url,
                })
                    .then(() => console.log('Successful share'))
                    .catch((error) => console.log('Error sharing', error));
            } else {
                window.open(url, '_blank');
            }
        };

        vm.confirm = () => {
            if (!vm.onSave) { return; }
            vm.saving = true;
            vm.onSave()(vm.address).then(
                () => { }, () => { }
            ).then(() => {
                vm.addressDataForm.$setPristine();
                vm.addressDataForm.$setUntouched();
                vm.saving = false;
            });
        };

        if (!vm.address.position) {
            vm.map.center = angular.copy(defaultCenter);
        } else {
            vm.map.center = {
                lat: vm.address.position.coordinates[1],
                lng: vm.address.position.coordinates[0],
                zoom: 16
            };
        }

        $scope.$watch('vm.address.position', position => {
            if (_.isEmpty(position)) { return; }
            Object.assign(vm.map.center, {
                lat: position.coordinates[1],
                lng: position.coordinates[0]
            });
        }, true);

        $scope.$watch('vm.map.center', center => {
            if (center && vm.address && vm.address.position) {
                if (!(center.lat === vm.address.position.coordinates[1] && center.lng === vm.address.position.coordinates[0])) {
                    vm.positionConfirmed = false;
                    return;
/* 
                    addressFactory.getAddressAutocompleteReverse({
                        lat: center.lat, lng: center.lng
                    }).then(suggestedAddress => {
                        vm.suggestedAddress = suggestedAddress;
                        $scope.$apply();
                    });
 */
                } else {
                    vm.positionConfirmed = true;
                }
            }
        }, true);

        vm.applySuggestedAddress = (suggestedAddress) => {
            vm.address.text = suggestedAddress.address.road;
            communeFactory.get(suggestedAddress.address.city).then(commune => {
                if (vm.address.state !== commune.region) {
                    communeFactory.getAll(commune.region).then((response) => {
                        if (response.ok) {
                            vm.communes = response.obj.commune;
                        } else {
                            vm.communes = [];
                        }
                    });
                }
                vm.address.state = commune.region;
                vm.address.district = commune.id;
            });

            vm.suggestedAddress = undefined;
        };
    }
})();

