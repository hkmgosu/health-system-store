(function () {
    'use strict';
    app.factory('$articleCategoryFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/articlecategory/';
        return {
            getList: criteria => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getList', { criteria: criteria }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getManagedList: criteria => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getManagedList', { criteria: criteria }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getDetails: idCategory => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getDetails', { idCategory: idCategory }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            create: (articleCategory) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', { articleCategory: articleCategory }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            edit: (articleCategory) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'edit', { articleCategory: articleCategory }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            delete: idArticleCategory => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delete', { idArticleCategory: idArticleCategory }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getManagerList: (idArticleCategory) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getManagerList', { idArticleCategory: idArticleCategory }, (data) => {
                    data.ok ? resolve(data.obj || []) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            addManager: (body) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addManager', body, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            removeManager: (body) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'removeManager', body, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getBreadcrumbs: (hierarchy) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getBreadcrumbs', { hierarchy: hierarchy }, (data) => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();