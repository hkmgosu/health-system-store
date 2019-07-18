(function () {
    'use strict';
    app.factory('$workflowFactory', FactoryController);

    let resRequest = (data, promise) => {
        data.ok ? promise.resolve(data.obj) : promise.reject(data.msg);
        if (data.reload) {
            location.reload();
        }
    };

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/workflow/';
        return {
            getStatus: (module, getSupervisors) => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getStatus',
                    { module: module, getSupervisors: getSupervisors },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getEnabledStatusList: (id, module) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getEnabledStatusList', {
                    id: id,
                    module: module
                }, data => resRequest(data, deferred));
                return deferred.promise;
            },
            addSupervisor: (employee, status) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addSupervisor', {
                    employee: employee,
                    status: status
                }, data => resRequest(data, deferred));
                return deferred.promise;
            },
            rmSupervisor: (employee, status) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'rmSupervisor', {
                    employee: employee,
                    status: status
                }, data => resRequest(data, deferred));
                return deferred.promise;
            },
            getUnitReported: (idEmployee) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getUnitReported', {
                    idEmployee: idEmployee
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            canCreate: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'canCreate', function (data) {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();