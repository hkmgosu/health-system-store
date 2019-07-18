(function() {
    'use strict';
    app.factory('unitProductRequestFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/storage/unitProductRequest/';
        return {
            getAll: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAll', params,
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            create: unitProductRequest => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                        unitProductRequest
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            delete: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delete', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            })
        };
    }
})();