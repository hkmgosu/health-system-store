(function() {
    'use strict';
    app.factory('inventoryFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/storage/inventory/';
        return {
            get: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getAll: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAll', params,
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            create: inventory => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                        inventory
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            update: inventory => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'update', {
                        inventory
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
            }),

            updateInventoryDetail: inventoryDetail => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'updateInventoryDetail', {
                        inventoryDetail
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getParams: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getParams', data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
            }),
        };
    }
})();