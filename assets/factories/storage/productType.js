(function() {
    'use strict';
    app.factory('productTypeFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/Storage/productType/';
        return {
            get: idProductType => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', {
                    idProductType
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),
            getList: filter => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getList', filter, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),
            save: productType => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'save', {
                    productType
                }, data => {
                    data.ok ? resolve(data.obj) : reject(data.obj)
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),
            delete: function(id) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'delete', {
                    id: id
                }, function(data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
        };
    }
})();