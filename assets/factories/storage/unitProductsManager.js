(function() {
    'use strict';
    app.factory('unitProductsManagerFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/Storage/UnitProductsManager/';
        return {
            getAll: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAll', {
                    params
                }, data => {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),

            getProductUnits: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getProductUnits', {
                    id
                }, data => {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),

            getProductStoragesStock: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getProductStoragesStock', {
                    id
                }, data => {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),

            getAllowedUnits: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAllowedUnits', params,
                    data => {
                        data.ok ? resolve(data.obj) : reject(data.obj);
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getStorages: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getStorages', params,
                    data => {
                        data.ok ? resolve(data.obj) : reject(data.obj);
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            save: unitProductsManager => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'save', {
                    unitProductsManager
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
            }
        };
    }
})();