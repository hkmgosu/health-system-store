(function () {
    'use strict';
    app.factory('remFactory', RemController);

    function RemController($q) {
        var urlBase = '/rem/';
        return {
            getCallReasons: () => {
                let deferred = $q.defer();
                io.socket.post(urlBase + 'getCallReasons', function (data) {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getSubCallReasons: callReason => {
                let deferred = $q.defer();
                io.socket.post(urlBase + 'getSubCallReasons', {
                    callReason: callReason
                }, function (data) {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getApplicantTypes: () => {
                let deferred = $q.defer();
                io.socket.post(urlBase + 'getApplicantTypes', function (data) {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getRemStatus: () => {
                let deferred = $q.defer();
                io.socket.post(urlBase + 'getRemStatus', function (data) {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            get: (idRem) => {
                let deferred = $q.defer();
                io.socket.post(urlBase + 'get', { idRem: idRem }, function (data) {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getDynamic: function (query) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getDynamic', query, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            save: function (data, options) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'save', {
                    rem: data,
                    options: options
                }, function (data) {
                    if (data.ok) {
                        deferred.resolve(data);
                    } else {
                        deferred.reject(data);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            addComment: function (comment, mentionedList) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addComment', { comment: comment, mentionedList: mentionedList }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getTimeline: function (idRem) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getTimeline', { idRem: idRem }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getEcg: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getEcg', (data) => {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getVehiclePatientList: idRem => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getVehiclePatientList', { idRem: idRem }, (data) => {
                    deferred.resolve(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            saveRemVehicle: (remVehicleUpdated, logType) => new Promise((resolve, reject) => {
                let remVehicle = angular.copy(remVehicleUpdated);
                if (!_.isEmpty(remVehicle.participantList)) {
                    remVehicle.participantList = remVehicle.participantList.map(participant => {
                        return Object.assign(participant, { member: participant.member.id });
                    });
                }
                if (_.isObject(remVehicle.establishment)) { remVehicle.establishment = remVehicle.establishment.id; }
                if (_.isObject(remVehicle.deliveryEstablishment)) { remVehicle.deliveryEstablishment = remVehicle.deliveryEstablishment.id; }
                if (_.isObject(remVehicle.vehicle)) { remVehicle.vehicle = remVehicle.vehicle.id; }
                if (_.isObject(remVehicle.status)) { remVehicle.status = remVehicle.status.id; }

                io.socket.post(urlBase + 'saveRemVehicle', { remVehicle: remVehicle, logType: logType }, (data) => {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) { location.reload(); }
                });
            }),
            saveRemPatient: (remPatient, logType) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveRemPatient', { remPatient: remPatient, logType: logType }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            createMultiplePatients: (patientsToCreate, idRem) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'createMultiplePatients', {
                    patientsToCreate: patientsToCreate,
                    idRem: idRem
                }, (data) => {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                });
                return deferred.promise;
            },
            getRegulatorObservations: remPatient => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRegulatorObservations', { remPatient: remPatient }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            saveRegulatorObservations: regulatorObservation => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveRegulatorObservations', { regulator: regulatorObservation }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            subscribe: idRem => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'subscribe', { idRem: idRem }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getRemPatientById: (idRemPatient) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRemPatientById', { id: idRemPatient }, (data) => {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.msg);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            saveRemPatientIntervention: (remPatient) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveRemPatientIntervention', { remPatient: remPatient }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            saveRemPatientBasicEvolution: (remPatient) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveRemPatientBasicEvolution', { remPatient: remPatient }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            saveRemPatientVitalSigns: (remPatient) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveRemPatientVitalSigns', { remPatient: remPatient }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            saveRemPatientMedicines: (remPatient) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveRemPatientMedicines', { remPatient: remPatient }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            deleteRemPatientMedicines: (remPatient) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'deleteRemPatientMedicines', { remPatient: remPatient }, (data) => {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject(data.obj);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getRejectedReason: () => {
                return [{
                    id: 1,
                    description: 'Llamada para 133 o 132'
                }, {
                    id: 2,
                    description: 'Pitanza'
                }, {
                    id: 3,
                    description: 'Llamada sanitaria no SAMU'
                }, {
                    id: 4,
                    description: 'Número equivocado'
                }, {
                    id: 5,
                    description: 'Otro'
                }];
            },
            saveRejected: opts => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'saveRejected', { opts: opts }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getHeatMap: (filter) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getHeatMap', { filter: filter }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getReportByCallReason: (filter) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getReportByCallReason', { filter: filter }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getCallReport: (filter) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getCallReport', { filter: filter }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getTransferReport: (filter) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getTransferReport', { filter: filter }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getBaseReport: dates => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getBaseReport', { dates: dates }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getTransferWithoutPatientReport: dates => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getTransferWithoutPatientReport', { dates: dates }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getRemEight: dates => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRemEight', { dates: dates }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            }
        };
    }
    RemController.$inject = ['$q'];
})();