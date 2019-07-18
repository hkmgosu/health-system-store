(() => {
    'use strict';
    app.factory('accountFactory', AccountFactory);

    function AccountFactory() {
        var urlBase = '/storage/accountPlan/';
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
            create: accountPlan => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                        accountPlan
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),
            update: accountPlan => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'update', {
                        accountPlan
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