(function () {
    'use strict';
    app.factory('workshiftFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/workshift/';
        return {
            create: workshift => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', { workshift: workshift }, function (data) {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
            getDetails: idWorkshift => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getDetails', { idWorkshift: idWorkshift }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getCurrentWorkshift: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getCurrentWorkshift', function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getList: (filter, timeMode, paginate) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getList', {
                    filter: filter,
                    timeMode: timeMode,
                    paginate: paginate
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            addCareTeam: (idWorkshift, idVehicleList) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addCareTeam', {
                    idWorkshift: idWorkshift,
                    idVehicleList: idVehicleList
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
            removeCareTeam: (idCareTeam) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'removeCareTeam', {
                    idCareTeam: idCareTeam
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            addComment: comment => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addComment', { comment: comment }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getTimeline: idWorkshift => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getTimeline', { idWorkshift: idWorkshift }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getFullCareTeamList: idWorkshift => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getFullCareTeamList', { idWorkshift: idWorkshift }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getEstablishmentVehicleList: idEstablishment => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getEstablishmentVehicleList', { idEstablishment: idEstablishment }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            delete: idWorkshift => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delete', { idWorkshift: idWorkshift }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            validate: idWorkshift => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'validate', { idWorkshift: idWorkshift }, function (data) {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
            getEmployeeHistory: (idEmployee, endTime) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getEmployeeHistory', { idEmployee: idEmployee, endTime: endTime }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            update: workshift => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'update', { workshift: workshift }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            copy: copyValues => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'copy', { copyValues: copyValues }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            remoteValidate: workshift => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'remoteValidate', { workshift: workshift }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            updateJob: (idParticipant, idJob, replace) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'updateJob', {
                    idParticipant: idParticipant,
                    idJob: idJob,
                    replace: replace
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();