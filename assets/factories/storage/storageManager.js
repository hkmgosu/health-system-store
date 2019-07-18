(function() {
    'use strict';
    app.factory('storageManagerFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/Storage/storageManager/';
        return {
            get: idStorageManager => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', {
                    idStorageManager
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),

            getAll: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAll', params, data => {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),

            save: storageManager => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'save', {
                    storageManager
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

            saveStorageUnit: function(data) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveStorageUnit', data, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },

            getStorageUnits: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getStorageUnits', function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getStorageManagers: unit => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getStorageManagers', {
                    unit: unit
                }, data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            addStorageManager: (employee, unit) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addStorageManager', {
                    unit: unit,
                    employee: employee
                }, data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            rmStorageManager: (employee, unit) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'rmStorageManager', {
                    unit: unit,
                    employee: employee
                }, data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            updateStorageManager: storageManager => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'updateStorageManager', storageManager, data => {
                    data.ok ? resolve(data.obj) : reject(data.obj)
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),
        };
    }
})();