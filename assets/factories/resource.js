(function () {
    'use strict';
    app.factory('$resourceFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q, localStorageService) {
        var urlBase = '/resource/';
        return {
            getList: (filter, paginate) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getList', {
                    filter: filter,
                    paginate: paginate
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getExportList: (filter) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getExportList', { filter: filter }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            create: resource => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'create', { resource: resource }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            update: resource => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'update', { resource: resource }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getResourceTypeList: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getResourceTypeList', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getResourceStatusList: () => {
                var deferred = $q.defer();
                let storageResults = localStorageService.get('resourceStatusList');
                if (storageResults) {
                    async.setImmediate(() => deferred.resolve(storageResults));
                } else {
                    io.socket.post(urlBase + 'getResourceStatusList', function (data) {
                        if (data.ok) {
                            localStorageService.set('resourceStatusList', data.obj);
                            deferred.resolve(data.obj);
                        } else {
                            deferred.reject();
                        }
                        if (data.reload) { location.reload(); }
                    });
                }
                return deferred.promise;
            },
            updateLocationInfo: (resource, opts) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'updateLocationInfo', {
                    resource: resource,
                    opts: opts
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getEmployeeResourceList: (idEmployee) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getEmployeeResourceList', {
                    idEmployee: idEmployee
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getEmployeeListByResource: (idResource) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getEmployeeListByResource', {
                    idResource: idResource
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getMyEmployeeResourceList: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getMyEmployeeResourceList', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getAssignmentCoincidences: (jsonData) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAssignmentCoincidences', { jsonData: jsonData }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            }
        };
    }
})();