(function () {
    'use strict';
    app.factory('remAccessFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/remaccess/';
        return {
            get: idRem => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', { idRem: idRem }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getEmployeeAccessList: (idEmployee, accessDate) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getEmployeeAccessList', { idEmployee: idEmployee, accessDate: accessDate }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
        };
    }
})();