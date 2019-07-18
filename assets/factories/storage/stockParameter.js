(function() {
    'use strict';
    app.factory('stockParameterFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/Storage/stockParameter/';
        return {
            get: idStockParameter => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', {
                    idStockParameter
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),
            getAll: filter => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAll', filter, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),
            save: stockParameter => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'save', {
                    stockParameter
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