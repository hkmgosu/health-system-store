(function () {
    'use strict';
    app.factory('establishmentFactory', EstablishmentController);

    function EstablishmentController($q) {
        var urlBase = '/establishment/';
        var localData = [];
        return {
            get: function (filter, paginate, options) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', {
                    filter: filter,
                    paginate: paginate,
                    options: options || {}
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getAll: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', function (data) {
                    localData = data.obj.establishments;
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllPublic: function (cb) {
                io.socket.post(urlBase + 'getAllPublic', function (data) {
                    cb(null, data.obj.establishments);
                    if (data.reload) {
                        location.reload();
                    }
                });
            },
            save: function (data) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'save', { establishment: data }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            delete: function (id) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'delete', { id: id }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getBedManagementSupervisors: idEstablishment => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getBedManagementSupervisors', {
                    idEstablishment: idEstablishment
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            setBedManagementModuleAvailable: (idEstablishment, bedManagementModuleAvailable) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setBedManagementModuleAvailable', {
                    idEstablishment: idEstablishment,
                    bedManagementModuleAvailable: bedManagementModuleAvailable
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            addBedManagementSupervisor: (idEstablishment, idEmployee) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addBedManagementSupervisor', {
                    idEstablishment: idEstablishment,
                    idEmployee: idEmployee
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            removeBedManagementSupervisor: (idEstablishment, idEmployee) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'removeBedManagementSupervisor', {
                    idEstablishment: idEstablishment,
                    idEmployee: idEmployee
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAdverseEventModuleAvailable: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAdverseEventModuleAvailable', data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAdverseEventSupervisors: establishment => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAdverseEventSupervisors', { establishment: establishment }, data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            addAdverseEventSupervisors: (employee, establishment) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addAdverseEventSupervisors',
                    {
                        establishment: establishment,
                        employee: employee
                    }, data => {
                        deferred.resolve(data);
                        if (data.reload) {
                            location.reload();
                        }
                    });
                return deferred.promise;
            },
            rmAdverseEventSupervisors: (employee, establishment) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'rmAdverseEventSupervisors',
                    {
                        establishment: establishment,
                        employee: employee
                    }, data => {
                        deferred.resolve(data);
                        if (data.reload) {
                            location.reload();
                        }
                    });
                return deferred.promise;
            }
        };
    }
    EstablishmentController.$inject = ['$q'];
})();