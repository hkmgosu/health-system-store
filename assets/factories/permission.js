(function () {
    'use strict';
    app.factory('$permissionFactory', FactoryController);

    let resRequest = (data, promise) => {
        if (data.ok) {
            promise.resolve(data.obj);
        } else {
            promise.reject(data.obj);
        }
    };

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/permission/';
        return {
            getSent: query => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getSent',
                    query,
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getDetails: id => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getDetails',
                    { id },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getPermissionTypeList: id => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getPermissionTypeList',
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            create: permission => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'create',
                    { permission: permission },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getHolidays: (from, until) => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getHolidays',
                    { from, until },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getSupervised: query => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getSupervised',
                    query,
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            setStatus: params => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setStatus', params, data => resRequest(data, deferred));
                return deferred.promise;
            },
            createClosure: closure => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'createClosure',
                    { closure: closure },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getClosures: () => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getClosures',
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
            addComment: (comment) => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'addComment',
                    { comment: comment },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            getTimeline: id => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getTimeline',
                    { id },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            confirm: permissionClosure => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'confirm',
                    { permissionClosure: permissionClosure },
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            }
        };
    }
})();