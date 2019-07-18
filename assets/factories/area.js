(function () {
    'use strict';
    app.factory('areaFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/area/';
        return {
            getAll: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAll', data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            save: area => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'save', { area: area }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();