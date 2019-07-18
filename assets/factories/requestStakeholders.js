(function () {
    'use strict';
    app.factory('requestStakeholdersFactory', factoryController);

    function factoryController($q) {
        var urlBase = '/requestStakeholders/';
        return {
            get: function (query) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', query, function (data) {
                    if (data.ok) {
                        // TODO parse
                    } else {
                        if (data.reload) {
                            location.reload();
                        }
                    }
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            setSubscribed: function (query) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setSubscribed', query, function (data) {
                    if (data.ok) {
                        // TODO parse
                    } else {
                        if (data.reload) {
                            location.reload();
                        }
                    }
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            addStakeholder: function (stakeholder) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addStakeholder', stakeholder, function (data) {
                    if (data.ok) {
                        // TODO parse
                    } else {
                        if (data.reload) {
                            location.reload();
                        }
                    }
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            rmStakeholder: function (stakeholder) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'rmStakeholder', {
                    requestStakeholder: stakeholder,
                }, function (data) {
                    if (data.ok) {
                        // TODO parse
                    } else {
                        if (data.reload) {
                            location.reload();
                        }
                    }
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        };
    }
})();