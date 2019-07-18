(function () {
    'use strict';
    app.factory('unitFactory', UnitController);

    function UnitController($q) {
        var urlBase = '/unit/';
        var localData = [];
        var roleTypes = [
            { name: 'Jefe', value: 'boss' },
            { name: 'Jefe subrogante', value: 'surrogateBoss' }
        ];
        return {
            get: function (query, getTotal) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', query, function (data) {
                    if (data.ok) {
                        if (getTotal) {
                            deferred.resolve({
                                list: data.obj.list,
                                total: data.obj.total
                            });
                        } else {
                            deferred.resolve(data.obj.list);
                        }
                    } else {
                        deferred.reject();
                    }
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getRequestUnits: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getRequestUnits', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getSupervisors: idUnit => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getSupervisors', {
                    idUnit: idUnit
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAll: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAll', function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            save: function (data) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'save', {
                    unit: data
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            addSupervisor: (idEmployee, idUnit) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addSupervisor', {
                    idEmployee: idEmployee,
                    idUnit: idUnit
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            rmSupervisor: (idEmployee, idUnit) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'rmSupervisor', {
                    idEmployee: idEmployee,
                    idUnit: idUnit
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            delete: function (id) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'delete', {
                    id: id
                }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            exportOrgChart: function (data) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'exportOrgChart', {
                    orgChart: data
                }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            mapEstablishment: (idUnit) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'mapEstablishment', {
                    idUnit: idUnit
                }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                });
                return deferred.promise;
            },
            getUnitsEstablishment: (establishment) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getUnitsEstablishment', {
                    establishment: establishment
                }, data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getAdverseEventSupervisors: unit => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getAdverseEventSupervisors', {
                    unit: unit
                }, data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            addAdverseEventSupervisors: (employee, unit) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addAdverseEventSupervisors', {
                    unit: unit,
                    employee: employee
                }, data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            rmAdverseEventSupervisors: (employee, unit) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'rmAdverseEventSupervisors', {
                    unit: unit,
                    employee: employee
                }, data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getUnitsForStorageManagement: () => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getUnitsForStorageManagement', data => {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getMembersUnit: unit => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getMembersUnit', { unit: unit }, data => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            setMember: (unit, employee, role) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setMember', { unit: unit, employee: employee, role: role }, (data) => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            removeMember: (idEmployeeUnit) => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'removeMember', { id: idEmployeeUnit }, (data) => {
                    data.ok ? deferred.resolve(data) : deferred.reject(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getRoleTypes: () => {
                return roleTypes;
            }
        }
    }
    UnitController.$inject = ['$q'];
})();