(function () {
    'use strict';
    app.factory('employeeFactory', EmployeeController);

    function EmployeeController($q) {
        var urlBase = '/employee/';
        return {
            getList: function (query, getTotal) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getList', query, function (data) {
                    if (data.ok) {
                        if (getTotal) {
                            deferred.resolve({ list: data.obj.list, total: data.obj.total });
                        } else {
                            deferred.resolve(data.obj.list);
                        }
                    } else { deferred.reject(); }
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getListPublic: (query, getTotal) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getListPublic', query, function (data) {
                    if (data.ok) {
                        if (getTotal) {
                            resolve({ list: data.obj.list, total: data.obj.total });
                        } else {
                            resolve(data.obj.list);
                        }
                    } else { reject(); }
                    if (data.reload) { location.reload(); }
                });
            }),
            get: idEmployee => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', { idEmployee: idEmployee }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            getParams: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getParams', data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            save: function (data) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'save', { employee: data }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            create: employee => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'save', { employee: employee }, data => {
                    data.ok ? resolve(data.obj) : reject()
                    if (data.reload) { location.reload(); }
                });
            }),
            delete: function (id) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'delete', { id: id }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            validateEmail: function (email) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'validateEmail', { email: email }, function (data) {
                    if (data.ok)
                        deferred.reject();
                    else {
                        if (data.reload) {
                            location.reload();
                        }
                        deferred.resolve();
                    }
                });
                return deferred.promise;
            },
            setPassword: function (idEmployee) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setPassword', { idEmployee: idEmployee }, function (data) {
                    data.ok ? deferred.resolve() : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getSharedFiles: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getSharedFiles', function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getTypecasting: function (employeeId) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getTypecasting', { id: employeeId }, function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            getMyTypecasting: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getMyTypecasting', function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            firstUpdate: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'firstUpdate', { employee: data }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getPerUnit: function (query) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getPerUnit', query, function (data) {
                    if (data.reload) {
                        location.reload();
                    }
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            setUnit: (data) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setUnit', { employee: data }, (data) => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getSupervisedUnits: (idEmployee) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getSupervisedUnits', { idEmployee: idEmployee }, (data) => {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            addSupervisedUnit: function (idEmployee, idUnit) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addSupervisedUnit', {
                    idEmployee: idEmployee,
                    idUnit: idUnit
                }, function (data) {
                    if (data.ok) { deferred.resolve(); }
                    else { deferred.reject(); }

                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            removeSupervisedUnit: function (idEmployee, idUnit) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'removeSupervisedUnit', {
                    idEmployee: idEmployee,
                    idUnit: idUnit
                }, function (data) {
                    if (data.ok) { deferred.resolve(); }
                    else { deferred.reject(); }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            deleteProfilePicture: idEmployee => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'deleteProfilePicture', { idEmployee: idEmployee }, data => {
                    data.ok ? resolve() : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            deleteMyProfilePicture: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'deleteMyProfilePicture', data => {
                    data.ok ? resolve() : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            updatePersonalData: function (personalData) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'updatePersonalData', personalData, function (data) {
                    if (data.ok) { deferred.resolve(); }
                    else { deferred.reject(); }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            updatePasswordData: function (passwordData) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'updatePasswordData', passwordData, function (data) {
                    if (data.ok) { deferred.resolve(); }
                    else { deferred.reject(); }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getProfile: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getProfile', function (data) {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    }
                    else {
                        deferred.reject();
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getProfileById: function (idEmployee) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getProfileById', { id: idEmployee }, function (data) {
                    if (data.ok) deferred.resolve(data.obj);
                    else deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAdverseEventSupervised: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAdverseEventSupervised', data => {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.reject(data.obj);
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            syncFromApi: identifier => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'syncFromApi', { identifier: identifier }, data => {
                    (data.ok) ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            addProfile: (idEmployee, idProfile) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addProfile', {
                    idEmployee: idEmployee,
                    idProfile: idProfile
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            }),
            removeProfile: (idEmployee, idProfile) => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'removeProfile', {
                    idEmployee: idEmployee,
                    idProfile: idProfile
                }, data => {
                    data.ok ? resolve(data.obj) : reject();
                    if (data.reload) { location.reload(); }
                });
            })
        };
    }
    EmployeeController.$inject = ['$q'];
})();