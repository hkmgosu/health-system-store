(function () {
    'use strict';
    app.factory('remStatusFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/remstatus/';
        return {
            create: status => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', { status: status }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getSupervisorList: (idStatus) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getSupervisorList', { idStatus: idStatus }, function (data) {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) { location.reload(); }
                });
            }),
            addSupervisor: (idStatus, idJob) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addSupervisor', {
                    idStatus: idStatus,
                    idJob: idJob
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) { location.reload(); }
                });
            }),
            removeSupervisor: (idStatus, idJob) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'removeSupervisor', {
                    idStatus: idStatus,
                    idJob: idJob
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject(data.obj);
                    if (data.reload) { location.reload(); }
                });
            }),
            updateOrder: (statusList) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'updateOrder', {
                    statusList: statusList
                }, function (data) {
                    (data && data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();