(function () {
    'use strict';
    app.factory('requestFactory', RequestController);

    function RequestController($q) {
        var urlBase = '/request/';
        return {
            get: function (query) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'get', query, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getDetails: function (id) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getDetails', { id: id }, function (data) {
                    if (data.ok) {
                        data.obj.dueDate = (data.obj.dueDate) ? new Date(data.obj.dueDate) : null;
                    }
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            addComment: function (comment, mentionedList) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'addComment', { comment: comment, mentionedList: mentionedList }, function (data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) { location.reload(); }
                });
                return deferred.promise;
            },
            getTimeline: function (id) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getTimeline', { id: id }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getLabels: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getLabels', function (data) {
                    if (data && data.ok)
                        deferred.resolve(data.obj);
                    else
                        deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getStates: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getStates', function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            setUnitAssigned: function (id, unitAssigned, comment, assignedOld) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setUnitAssigned', {
                    id: id,
                    unitAssigned: unitAssigned,
                    comment: comment,
                    assignedOld: assignedOld
                }, function (data) {
                    if (data && data.ok)
                        deferred.resolve(data);
                    else
                        deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            setEmployeeAssigned: function (id, newEmployeeAssigned, oldEmployeeAssigned, maintainAsStakeholder, comment) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setEmployeeAssigned', {
                    id: id,
                    newEmployeeAssigned: newEmployeeAssigned,
                    oldEmployeeAssigned: oldEmployeeAssigned,
                    maintainAsStakeholder: maintainAsStakeholder,
                    comment: comment
                }, function (data) {
                    if (data && data.ok)
                        deferred.resolve(data);
                    else
                        deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            setLabel: function (id, label) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setLabel', {
                    id: id,
                    label: label
                }, function (data) {
                    if (data && data.ok)
                        deferred.resolve(data);
                    else
                        deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            setDueDate: function (id, dueDate) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setDueDate', {
                    id: id,
                    dueDate: dueDate
                }, function (data) {
                    if (data && data.ok)
                        deferred.resolve(data);
                    else
                        deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            setState: function (id, state) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'setState', {
                    id: id,
                    state: state
                }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            create: function (data, selfAssigned) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'create', {
                    request: data,
                    selfAssigned: selfAssigned
                }, function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getSubscribed: function (query) {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getSubscribed', query, function (data) {
                    data.ok ? deferred.resolve(data.obj.requests) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getSupervised: function (query) {
                var deferred = $q.defer();
                query.supervisedUnits = _.map(_.filter(query.supervisedUnits, 'checked'), 'id') || [];
                io.socket.post(urlBase + 'getSupervised', query, function (data) {
                    data.ok ? deferred.resolve(data.obj.requests) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            unsubscribe: function (id) {
                io.socket.post(urlBase + 'unsubscribe', {
                    id: id
                }, function (data) {
                    console.log('unsubscribed');
                    if (data.reload) {
                        location.reload();
                    }
                });
            },
            canAutoassign: function () {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'canAutoassign', function (data) {
                    deferred.resolve(data);
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getPopularTags: searchText => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getPopularTags', {
                    searchText: searchText,
                }, function (data) {
                    if (data.ok) {
                        deferred.resolve(data.obj);
                    } else {
                        deferred.resolve([]);
                    }
                });
                return deferred.promise;
            }
        };
    }
    RequestController.$inject = ['$q'];
})();