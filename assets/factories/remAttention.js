(function () {
    'use strict';
    app.factory('remAttentionFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/remAttention/';
        return {
            getItems: (query) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getItems', query, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getClasses: (query) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getClasses', query, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            saveItem: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveItem', { attentionItem: data }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            saveClass: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveClass', { attentionClass: data }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            deleteItem: (id) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'deleteItem', { id: id }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            deleteClass: (id) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'deleteClass', { id: id }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllClasses: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllClasses', data, (data) => {
                    data.ok ? deferred.resolve(data.obj.attentionClasses) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllItems: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllItems', data, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getRemPatientAttentions: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRemPatientAttentions', data, (data) => {
                    data.ok ? deferred.resolve(data.obj.setAttentions) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            }
        };
    }
})();