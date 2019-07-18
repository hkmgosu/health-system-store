(function () {
    'use strict';
    app.factory('$bedFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/bed/';
        return {
            getRoomList: (idUnit) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getRoomList', {
                    idUnit: idUnit
                }, (data) => {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
            getUnitList: (idEstablishment) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getUnitList', {
                    idEstablishment: idEstablishment
                }, (data) => {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
            addRoom: (room) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addRoom', {
                    room: room
                }, (data) => {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
            addBed: (bed) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addBed', {
                    bed: bed
                }, (data) => {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
            addBedPatient: (bedPatient) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addBedPatient', { bedPatient: bedPatient }, (data) => {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
        };
    }
})();