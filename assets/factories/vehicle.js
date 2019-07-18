(function () {
    'use strict';
    app.factory('vehicleFactory', VehicleController);

    function VehicleController($q) {
        var urlBase = '/vehicle/';
        return {
            watch: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'watch', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            get: function (query) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', query, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAll: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            save: function (data) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'save', { vehicle: data }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            delete: function (idVehicle) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'delete', { idVehicle: idVehicle }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            updateStatus: (idVehicle, idStatus) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'updateStatus', {
                    idVehicle: idVehicle,
                    idStatus: idStatus
                }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    data.reload ? location.reload() : null;
                });
                return deferred.promise;
            },
            getRemLog: (idRemVehicle) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRemLog', {
                    idRemVehicle: idRemVehicle
                }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    data.reload ? location.reload() : null;
                });
                return deferred.promise;
            },
            getRemHistory: idVehicle => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRemHistory', {
                    idVehicle: idVehicle
                }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    data.reload ? location.reload() : null;
                });
                return deferred.promise;
            },
            getRemVehicleRoute: idRemVehicle => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRemVehicleRoute', {
                    idRemVehicle: idRemVehicle
                }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    data.reload ? location.reload() : null;
                });
                return deferred.promise;
            },
            getCurrentCareTeam: idVehicle => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getCurrentCareTeam', { idVehicle: idVehicle }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
    VehicleController.$inject = ['$q'];
})();