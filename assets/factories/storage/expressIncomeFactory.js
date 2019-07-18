(function() {
    'use strict';
    app.factory('expressIncomeFactory', FactoryController);

    /* @ngInject */
    function FactoryController($q) {
        var urlBase = '/storage/expressIncome/';
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

            getDetail: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getDetail', {
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


            addDetail: expressIncomeDetail => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addDetail', {
                        expressIncomeDetail
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            delDetail: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delDetail', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            saveDetail: expressIncomeDetail => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'saveDetail', {
                        expressIncomeDetail
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getAllDetail: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAllDetail', params,
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            create: expressIncome => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                        expressIncome
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            update: expressIncome => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'update', {
                        expressIncome
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


            unsubscribe: () => {
                io.socket.post(urlBase + 'unsubscribe', {},
                    function(data) {
                        console.log('unsubscribed');
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }
        };
    }
})();