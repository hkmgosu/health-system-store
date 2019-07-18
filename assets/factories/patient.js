(function () {
    'use strict';
    app.factory('patientFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/patient/';
        return {
            save: (data) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'save', { patient: data }, function (data) {
                    (data.ok) ? resolve(data) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            delete: (id) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'delete', { id: id }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getExternalPatient: (data) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getExternalPatient', {
                    identificationNumber: data.identificationNumber,
                    identificationType: data.identificationType
                }, (data) => {
                    if (data.ok) {
                        let tmpBirthdate = new Date(data.obj.birthdate);
                        Object.assign(data.obj, {
                            birthdate: tmpBirthdate,
                            estimatedYears: moment().diff(tmpBirthdate, 'years'),
                            estimatedMonths: moment().diff(tmpBirthdate, 'months') - (12 * moment().diff(tmpBirthdate, 'years'))
                        });
                        var estimatedDaysAux = moment(tmpBirthdate).add(data.obj.estimatedYears, 'year').add(data.obj.estimatedMonths, 'month');
                        data.obj.estimatedDays = Math.floor(moment.duration(moment().diff(estimatedDaysAux)).asDays());
                        resolve(data.obj);
                    } else { reject(data ? data.obj : null); }
                    if (data.reload) { location.reload(); }
                });
            }),
            getList: function (query, getTotal) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getList', query, function (data) {
                    if (data.ok) {
                        data.obj.list = data.obj.list.map(item => {
                            item.birthdate = item.birthdate ? new Date(item.birthdate) : null;
                            return item;
                        });
                        if (getTotal) {
                            deferred.resolve({ list: data.obj.list, total: data.obj.total });
                        } else {
                            deferred.resolve(data.obj.list);
                        }
                    } else { deferred.reject(); }
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getClinicalHistory: idPatient => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getClinicalHistory', { idPatient: idPatient }, function (data) {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            identifyPatient: (idOldPatient, idNewPatient) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'identifyPatient', { idOldPatient: idOldPatient, idNewPatient: idNewPatient }, function (data) {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();