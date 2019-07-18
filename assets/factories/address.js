(function () {
    'use strict';
    app.factory('addressFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/address/';
        return {
            getAddressAutocomplete: (searchText, bounds) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAddressAutocomplete', {
                    searchText: searchText, bounds: bounds
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getAddressAutocompleteReverse: (latLngParams) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAddressAutocompleteReverse', latLngParams, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
        };
    }
})();