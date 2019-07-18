(function () {
    'use strict';
    app.factory('utilitiesFactory', FactoryController);

    function FactoryController($q) {
        var urlBase = '/utilities/';
        var gender = [
            { name: 'GENDER.FEMALE', value: 'female' },
            { name: 'GENDER.MALE', value: 'male' }
        ];
        var idType = [
            { name: 'IDTYPE.RUT', value: 'rut' },
            { name: 'IDTYPE.PASSPORT', value: 'passport' },
            { name: 'IDTYPE.NEWBORN', value: 'newborn' },
            { name: 'IDTYPE.NN', value: 'nn' },
            { name: 'IDTYPE.FOREIGNID', value: 'foreign' }
        ];
        var priority = [
            { name: 'S1', value: 'S1' },
            { name: 'S2', value: 'S2' },
            { name: 'S3', value: 'S3' },
            { name: 'S4', value: 'S4' },
            { name: 'S5', value: 'S5' }
        ];
        var triages = [
            { name: 'PATIENT.EVOLUTION.TRIAGE.RED', value: 'rojo' },
            { name: 'PATIENT.EVOLUTION.TRIAGE.GREEN', value: 'verde' },
            { name: 'PATIENT.EVOLUTION.TRIAGE.YELLOW', value: 'amarillo' },
            { name: 'PATIENT.EVOLUTION.TRIAGE.BLACK', value: 'negro' }
        ];
        var typePatient = [
            { name: 'ADVERSEEVENT.TYPEPATIENT.AMBULATORY', value: 'ambulatory' },
            { name: 'ADVERSEEVENT.TYPEPATIENT.HOSPITALIZED', value: 'hospitalized' },
            { name: 'ADVERSEEVENT.TYPEPATIENT.HOMEHOSPITALIZATION', value: 'homehospitalization' }
        ];
        var relationships = [
            { name: 'PATIENT.RELATIONSHIPS.FATHER', value: 'father' },
            { name: 'PATIENT.RELATIONSHIPS.MOTHER', value: 'mother' }
        ];
        return {
            getGender: () => {
                return gender;
            },
            getIdType: (idTypeVisibility) => {
                idTypeVisibility = _.defaults(idTypeVisibility || {}, {
                    rut: true,
                    passport: true,
                    newborn: true,
                    nn: true,
                    foreign: true
                });
                return _.filter(idType, (o) => { return idTypeVisibility[o.value]; });
            },
            getPriority: () => {
                return priority;
            },
            getTriages: () => {
                return triages;
            },
            getDateTime: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getDateTime', data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getTypePatient: () => {
                return typePatient;
            },
            getRelationships: () => {
                return relationships;
            }
        };
    }
})();