(function () {
    'use strict';
    app.factory('viaticClosureFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/viaticClosure/';
        return {
            getList: filter => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getList', filter, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            create: (viaticClosure) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                    viaticClosure: viaticClosure
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getDetails: idViaticClosure => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getDetails', {
                    idViaticClosure: idViaticClosure
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            confirm: viaticClosure => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'confirm', {
                    viaticClosure: viaticClosure
                }, function (data) {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();