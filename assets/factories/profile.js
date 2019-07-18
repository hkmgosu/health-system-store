(function () {
    'use strict';
    app.factory('profileFactory', FactoryController);

    /* @ngInject */
    function FactoryController() {
        var urlBase = '/profile/';
        return {
            getList: (searchText) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getList', { searchText: searchText }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getDetails: idProfile => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getDetails', { idProfile: idProfile }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getConfigProfiles: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getConfigProfiles', data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getEmployeeList: (idProfile, searchText, limit, page) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getEmployeeList', {
                    idProfile: idProfile,
                    searchText: searchText,
                    limit: limit,
                    page: page
                }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            addEmployeeList: (idProfile, idList) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addEmployeeList', {
                    idProfile: idProfile,
                    idList: idList,
                }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            addAllEmployees: (idProfile) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addAllEmployees', {
                    idProfile: idProfile
                }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            removeAllEmployees: (idProfile) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'removeAllEmployees', {
                    idProfile: idProfile
                }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            create: profile => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                    profile: profile
                }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            update: profile => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'update', {
                    profile: profile
                }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            delete: idProfile => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delete', {
                    idProfile: idProfile
                }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
})();