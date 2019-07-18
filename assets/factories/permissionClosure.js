(() => {
    'use strict';
    app.factory('$permissionClosureFactory', FactoryController);

    let resRequest = (data, promise) => {
        if (data.ok) {
            promise.resolve(data.obj);
        } else {
            promise.reject(data.obj);
        }
    };

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/permissionclosure/';
        return {
            createClosure: closure => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'createClosure',
                    { closure: closure },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getClosures: (page) => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getClosures',
                    { page: page },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getClosureDetails: id => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getClosureDetails',
                    { id: id },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            confirm: permissionClosure => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'confirm',
                    { closure: permissionClosure },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            }
        };
    }
})();