(function () {
    'use strict';
    app.factory('$viaticFactory', FactoryController);

    let resRequest = (data, promise) => {
        if (data.ok) {
            promise.resolve(data.obj);
        } else {
            promise.reject(data.obj);
        }
    };

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/viatic/';
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
            getSupervised: query => {
                var deferred = $q.defer();
                io.socket.post(
                    urlBase + 'getSupervised',
                    query,
                    data => resRequest(data, deferred)
                );
                return deferred.promise;
            },
            create: viatic => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', { viatic: viatic }, data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            }),
            getValues: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getValues', data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            }),
            addComment: comment => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addComment', { comment: comment, id: comment.idModelModule }, data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            }),
            getTimeline: idViatic => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getTimeline', { id: idViatic }, data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            }),
            changeStatus: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'changeStatus', params, data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            }),
            getList: filter => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getList', { filter: filter }, data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            }),
            validateDates: (fromDate, toDate) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'validateDates', { fromDate: fromDate, toDate: toDate }, data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            }),
            getTypeList: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getTypeList', data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            }),
            getStatusList: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getStatusList', data => {
                    data.ok ? resolve(data.obj) : reject();
                });
            })
        };
    }
})();