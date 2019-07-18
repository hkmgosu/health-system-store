(function () {
    'use strict';
    app.factory('$derivationStatusFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/derivationstatus/';
        return {
            getList: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getList', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            }
        };
    }
})();