(function () {
    'use strict';
    app.factory('vehicleStatusFactory', VehicleStatusController);

    function VehicleStatusController($q) {
        var urlBase = '/vehiclestatus/';
        return {
            getAll: types => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', { types: types }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            }
        };
    }
    VehicleStatusController.$inject = ['$q'];
})();