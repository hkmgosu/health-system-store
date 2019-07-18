(() => {
    'use strict';
    app.factory('$remPatientFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/rempatient/';
        return {
            get: idRemPatient => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', {
                    idRemPatient: idRemPatient
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getVitalSignsEvolution: idRemPatient => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getVitalSignsEvolution', {
                    idRemPatient: idRemPatient
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getMedicineHistory: idRemPatient => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getMedicineHistory', {
                    idRemPatient: idRemPatient
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            create: remPatient => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                    remPatient: remPatient
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getHistoryItemDetails: idRemPatient => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getHistoryItemDetails', {
                    idRemPatient: idRemPatient
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();