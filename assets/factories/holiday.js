(() => {
    'use strict';
    app.factory('$holidayFactory', FactoryController);

    let resRequest = (data, promise) => {
        if (data.ok) {
            promise.resolve(data.obj);
        } else {
            promise.reject(data.msg);
        }
    };

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/holiday/';
        return {
            getHolidays: (from, until) => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase +  'getHolidays',
                    {from, until},
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            }
        };
    }
})();