(() => {
    'use strict';
    app.factory('adverseEventFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/adverseevent/';
        var damageCategorization = {
            incident: [1, 2, 3, 4],
            adverse: [5, 6],
            sentinel: [7, 8, 9]
        };
        var damageCategories = {
            incident: {
                name: 'Incidente sin daño',
                ids: [1, 2, 3, 4]
            },
            adverse: {
                name: 'Evento adverso',
                ids: [5, 6]
            },
            sentinel: {
                name: 'Evento centinela',
                ids: [7, 8, 9]
            }
        };
        var sentinelOthers = [27, 30, 31, 36];
        var uppAreas = [
            { name: 'ADVERSEEVENT.UPPFORM.HEAD', value: 'head' },
            { name: 'ADVERSEEVENT.UPPFORM.UPPERLIMB', value: 'upperLimb' },
            { name: 'ADVERSEEVENT.UPPFORM.LOWERLIMB', value: 'lowerLimb' },
            { name: 'ADVERSEEVENT.UPPFORM.TRUNK', value: 'trunk' }
        ];
        var intrahospitalId = 1;
        return {
            getSent: (query) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getSent', query, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllDamageType: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getalldamagetype', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getUnitsEvents: (establishment) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getunitsevents', { establishment: establishment }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllEventType: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllEventType', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllTupleForm: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllTupleForm', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllAssociatedProcess: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllAssociatedProcess', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllParametricsFallForm: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllParametricsFallForm', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            updateEvent: (eventData, formData) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'updateEvent', { eventForm: { eventData: eventData, formData: formData } }, (data) => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            createEvent: (eventData, formData) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'createEvent', { eventForm: { eventData: eventData, formData: formData } }, (data) => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getDetails: (id) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getDetails', { id: id }, (data) => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getStatus: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getStatus', data => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            saveStatus: (id, status) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveStatus', { id: id, status: status }, data => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getParametricsAutocomplete: (filter, parametric) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getParametricsAutocomplete', { filter: filter, parametric: parametric }, data => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getEventsPatient: (idPatient) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getEventsPatient', { id: idPatient }, (data) => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getValidEstablishment: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getValidEstablishment', (data) => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getSupervised: query => {
                var deferred = $q.defer();
                query.supervisedUnits = _.map(_.filter(query.supervisedUnits, 'checked'), 'id') || [];
                query.supervisedEstablishment = _.map(_.filter(query.supervisedEstablishment, 'checked'), 'id') || [];
                io.socket.post(urlBase + 'getSupervised', query, data => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getDamageCategorization: () => {
                return damageCategorization;
            },
            getSentinelOthers: () => {
                return sentinelOthers;
            },
            getAllParametricsMedicationForm: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllParametricsMedicationForm', (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAllParametricsUppForm: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAllParametricsUppForm', (data) => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getUppAreas: () => {
                return uppAreas;
            },
            getDuplicatedEvents: origin => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getDuplicatedEvents', { origin }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            markDuplicateEvent: (idRegister, idEvent) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'markDuplicateEvent', { idRegister: idRegister, idEvent: idEvent }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            markNotDuplicateEvent: (idRegister, idEvent) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'markNotDuplicateEvent', { idRegister: idRegister, idEvent: idEvent }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getEventType: (query) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getEventType', query, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getDamageCategories: () => {
                return damageCategories;
            },
            unsubscribe: id => {
                io.socket.post(urlBase + 'unsubscribe', {
                    id: id
                }, data => {
                    console.log('unsubscribed');
                    if (data.reload) {
                        location.reload();
                    }
                });
            },
            getUppsPatient: patient => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getUppsPatient', {
                    patient: patient
                }, data => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getOriginOccurrence: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getOriginOccurrence', data => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.msg);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getIntrahospitalId: () => {
                return intrahospitalId;
            }
        };
    }
})();