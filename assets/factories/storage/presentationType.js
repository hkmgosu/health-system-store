(() => {
    'use strict';
    app.factory('presentationTypeFactory', PresentationTypeFactory);

    function PresentationTypeFactory() {
        var urlBase = '/storage/presentationType/';
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
            create: presentationType => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                        presentationType
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),
            update: presentationType => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'update', {
                        presentationType
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