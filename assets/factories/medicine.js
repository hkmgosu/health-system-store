(function () {
    'use strict';
    app.factory('medicineFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/medicine/';
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
            getAll: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getByIds: (ids) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getByIds', { ids: ids }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllMedicineVia: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllMedicineVia', (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            save: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'save', { medicine: data }, (data) => {
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
            getAllCategoryMedicines: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllCategoryMedicines', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllSubCategoryMedicines: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllSubCategoryMedicines', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllDrugCategories: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllDrugCategories', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getMedicineServiceByIds: (ids) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getMedicineServiceByIds', { ids: ids }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getMedicineService: (query) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getMedicineService', query, (data) => {
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