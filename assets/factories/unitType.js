(function () {
    'use strict';
    app.factory('unitTypeFactory', UnitTypeController);

    function UnitTypeController($q) {
        var urlBase = '/unitType/';
        return {
            getAll: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            }
        }
    }
    UnitTypeController.$inject = ['$q'];
})();