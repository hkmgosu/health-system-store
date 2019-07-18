(function () {
    'use strict';
    app.factory('remTransferStatusFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/remTransferStatus/';
        return {
            get: (query) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', query, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            save: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'save', { transferStatus: data }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            delete: (id) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'delete', { id: id }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAll: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', data, (data) => {
                    data.ok ? deferred.resolve(data.obj.transferStatus) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getRemPatientTransfer: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRemPatientTransfer', data, (data) => {
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