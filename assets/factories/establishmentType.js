(function () {
    'use strict';
    app.factory('establishmentTypeFactory', EstablishmentTypeController);

    function EstablishmentTypeController($q, Upload) {
        var urlBase = '/establishmentType/';
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
            getAllPublic: function (cb) {
                io.socket.post(urlBase + 'getAllPublic', function (data) {
                    cb(null, data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
            },
            save: function (data) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'save', { establishmentType: data }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            uploadIcon: function (id, file) {
                return Upload.upload({
                    url: urlBase + 'uploadIcon',
                    data: {
                        id: id,
                        file: file
                    }
                });
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
    EstablishmentTypeController.$inject = ['$q', 'Upload'];
})();