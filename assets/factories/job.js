(function () {
    'use strict';
    app.factory('jobFactory', JobController);

    function JobController($q) {
        var urlBase = '/job/';
        var localData = [];
        return {
            set: function (value) {
                this.data = value;
            },
            get: function (query) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', query, function (data) {
                    deferred.resolve(data);
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
                io.socket.post(urlBase + 'save', { job: data }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            delete: function (id) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'delete', { id: id }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            }
        };
    }
    JobController.$inject = ['$q'];
})();