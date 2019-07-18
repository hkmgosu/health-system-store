(function () {
    'use strict';
    app.factory('participantFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/participant/';
        return {
            add: participant => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'add', {
                    participant: participant
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject(data.msg);
                    if (data.reload) { location.reload(); }
                });
            }),
            remove: (idParticipant) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'remove', {
                    idParticipant: idParticipant
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();