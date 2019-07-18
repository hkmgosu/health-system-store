(function () {
    'use strict';
    app.factory('$articleFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/article/';
        return {
            getDetails: idArticle => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getDetails', { idArticle: idArticle }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getList: (criteria, paginate) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getList', { criteria: criteria, paginate: paginate }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getManagedList: (criteria, paginate) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getManagedList', { criteria: criteria, paginate: paginate }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            create: (article) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', { article: article }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            delete: (idArticle) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delete', { idArticle: idArticle }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            edit: (article) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'edit', { article: article }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getTagList: searchtext => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getTagList', { searchtext: searchtext }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();