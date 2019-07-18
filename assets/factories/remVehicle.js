(function () {
    'use strict';
    app.factory('remVehicleFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/remvehicle/';
        return {
            updateStatus: (idRemVehicle, idVehicle, idStatus) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'updateStatus', {
                    idRemVehicle: idRemVehicle,
                    idVehicle: idVehicle,
                    idStatus: idStatus
                }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    data.reload ? location.reload() : null;
                });
                return deferred.promise;
            },
            finishByRem: idRem => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'finishByRem', { idRem: idRem }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            }
        };
    }
})();