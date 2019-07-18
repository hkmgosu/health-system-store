(function () {
    'use strict';
    app.factory('communeFactory', CommuneController);

    function CommuneController($q) {
        var urlBase = '/commune/';
        return {
            get: function (searchText) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', { searchText: searchText }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAll: function (region) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', { region: region }, function (data) {
                    data.ok ? deferred.resolve(data.obj.commune) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAutocomplete: function (searchText) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAutocomplete', { searchText: searchText }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            }
        };
    }
    CommuneController.$inject = ['$q'];
})();