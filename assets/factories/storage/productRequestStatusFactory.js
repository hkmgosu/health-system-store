(() => {
    'use strict';
    app.factory('productRequestStatusFactory', ProductRequestStatusFactory);

    function ProductRequestStatusFactory() {
        var urlBase = '/storage/productRequestStatus/';
        return {
            get: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
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
            create: productRequestStatus => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                        productRequestStatus
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),
            update: productRequestStatus => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'update', {
                        productRequestStatus
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