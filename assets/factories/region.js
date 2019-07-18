(function () {
    'use strict';
    app.factory('regionFactory', RegionController);

    function RegionController($q) {
        var urlBase = '/region/';
        var localData = [];
        return {
            getAll: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', function (data) {
                    localData = data.obj.region;
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            }
        };
    }
    RegionController.$inject = ['$q'];
})();