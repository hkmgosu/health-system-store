(function () {
    'use strict';
    app.factory('$derivationFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/derivation/';
        return {
            get: id => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', { id: id }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getList: (finished, pagination, filter) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getList', {
                    finished: finished,
                    pagination: pagination,
                    filter: filter
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            create: derivation => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'create', { derivation: derivation }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getUnitListAvailable: (idEstablishment) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getUnitListAvailable', {
                    idEstablishment: idEstablishment
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            setUnitDerivationModuleAvailable: (idUnit, derivationModuleAvailable) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setUnitDerivationModuleAvailable', {
                    idUnit: idUnit,
                    derivationModuleAvailable: derivationModuleAvailable
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            addComment: comment => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addComment', { comment: comment }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getRequiredEquipmentList: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRequiredEquipmentList', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getTimeline: idDerivation => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getTimeline', { idDerivation: idDerivation }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            unsubscribe: function (id) {
                io.socket.post(urlBase + 'unsubscribe', { id: id }, function (data) {
                    console.log('unsubscribed');
                    if (data.reload) { location.reload(); }
                });
            },
            update: (derivation, log) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'update', { derivation: derivation, log: log }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getMySupervisedEstablishmentList: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getMySupervisedEstablishmentList', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            }
        };
    }
})();