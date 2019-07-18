/**
 * RequestController
 *
 * @description :: Server-side logic for managing requests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getDetails: function (req, res) {
        async.parallel({
            request: (cb) => {
                Request
                    .findOne({
                        id: req.body.id,
                        deleted: false,
                    })
                    .populate('label')
                    .populate('state')
                    .populate('createdBy')
                    .populate('unitAssigned')
                    .populate('employeeAssigned')
                    .populate('attachments')
                    .exec(cb);
            }, userTypes: (cb) => {
                InternalService
                    .getUserType(req.session.employee.id, req.body.id)
                    .then(function (resp) {
                        cb(null, resp);
                    })
                    .catch(function (err) {
                        cb(err || new Error('userTypeError'), null);
                    });
            }
        }, (err, results) => {
            if (err) {
                return res.send({ ok: false, msg: 'REQUEST.SEARCH.FOUND', obj: {} })
            }
            return res.send({ ok: true, msg: 'REQUEST.SEARCH.FOUND', obj: results.request, userTypes: results.userTypes });
        });
    },
    create: function (req, res) {

        let request = req.body.request;

        if (!request) {
            return res.send({ ok: false, msg: 'REQUEST.ERROR.CREATE', obj: {} });
        }

        //Pasar id usuario logeado como creador de la solicitud
        request.createdBy = req.session.employee.id;

        //Estado por defecto
        request.state = 1;

        let checkTags = (tags, idRequest) => {
            let tagsCollection = tags ? tags.split('#') : [];
            tagsCollection.forEach(tag => {
                RequestTag.findOrCreate({ name: tag }).then(requestTag => {
                    requestTag.counter++;
                    requestTag.requests.add(idRequest);
                    requestTag.save(() => { });
                });
            });
        };

        var saveRequest = () => {
            Request.create(request).exec(function (err, requestCreated) {
                if (err) {
                    return res.send({ ok: false, msg: 'REQUEST.NEW.SUBMIT.ERROR', obj: err });
                } else {
                    request.id = requestCreated.id;
                    if (request.unitAssigned) {
                        Unit
                            .findOne(request.unitAssigned.id)
                            .populate('supervisors', { id: { '!': req.session.employee.id } })
                            .exec(function (err, unit) {
                                if (unit) {
                                    var notifications = [];
                                    var mails = [];
                                    unit.supervisors.forEach(function (employee) {
                                        notifications.push({
                                            title: '<span><b>' + req.session.employee.fullname + '</b> envió una nueva solicitud a <b>' + request.unitAssigned.name + '</b></span>',
                                            modelModule: 'request',
                                            idModelModule: request.id,
                                            type: 'New-Request',
                                            assignedTo: employee.id
                                        });
                                        mails.push({
                                            employee: employee,
                                            requestId: request.id,
                                            title: 'Nueva solicitud',
                                            description: '<span><b>' + req.session.employee.fullname + '</b> envió una nueva solicitud a <b>' + request.unitAssigned.name + '</b></span>',
                                            type: 'default',
                                            request: request,
                                            sender: req.session.employee.fullname,
                                        });
                                    });

                                    NotificationService.sendNotifications(notifications);
                                    EmailService.sendRequestNotification(mails);
                                }
                            });
                    }

                    if (request.tags) { checkTags(request.tags, request.id); }

                    RequestStakeholders.create({
                        request: request.id,
                        employee: req.session.employee.id,
                        role: 'owner'
                    }).exec(function (err, sh) {
                        if (err) {
                            return res.send({ ok: false, msg: 'REQUEST.NEW.SUBMIT.ERROR', obj: err });
                        } else {
                            return res.send({ ok: true, msg: 'REQUEST.NEW.SUBMIT.SUCCESS', obj: { request: request } });
                        }
                    });
                }
            });
        };

        // Si es una creación de solicitud con autoasignación
        if (req.body.selfAssigned) {
            request.employeeAssigned = req.session.employee.id;
            // Buscar unidad a la que se va a derivar la solicitud
            // Si la unidad del funcionario tiene supervisores, entonces se deriva.
            // Sino se prueba con la unidad padre.
            Unit
                .findOne(req.session.employee.unit)
                .populate('parent')
                .exec(function (err, unit) {
                    if (err || !unit) {
                        return res.send({ ok: false, msg: 'REQUEST.NEW.SUBMIT.ERROR', obj: err });
                    } else if (unit.requestType) {
                        request.unitAssigned = unit;
                        saveRequest();
                    } else if (unit.parent && unit.parent.requestType) {
                        request.unitAssigned = unit.parent;
                        saveRequest();
                    } else {
                        return res.send({ ok: false, msg: 'REQUEST.NEW.SUBMIT.ERROR', obj: err });
                    }
                });
        } else {
            saveRequest();
        }
    },
    addComment: function (req, res) {
        let { comment, mentionedList } = req.body;
        if (!comment.idModelModule) {
            return res.send({ msg: 'REQUEST.ERROR.COMMENTID', ok: false });
        }
        comment.createdBy = req.session.employee.id;

        var updateRequestCommentCount = () => {
            Comment.count({ idModelModule: comment.idModelModule }).then(commentCount => {
                Request.update(comment.idModelModule, { commentCount: commentCount }).exec(() => { });
            }, err => sails.log(err));
        };

        if (comment.attachments) {
            _.remove(req.body.comment.attachments, (archive) => {
                if (!archive.id) {
                    return archive;
                }
            });
        }

        Comment.create(comment).exec(function (err, comment) {
            if (err) {
                return res.send({ ok: false, msg: 'COMMENT.ERROR.CREATE', obj: err });
            } else {
                comment.createdBy = req.session.employee;
                comment.attachments = req.body.comment.attachments;
                Request.message(comment.idModelModule, {
                    message: 'request:new-comment',
                    data: comment
                });
                RequestNotificationService.sendCommentNotification({
                    sender: _.pick(req.session.employee, ['id', 'fullname']),
                    request: comment.idModelModule,
                    comment: comment.description
                });
                updateRequestCommentCount();
                return res.send({ ok: true, msg: 'COMMENT.SUCCESS.CREATE', obj: comment });
            }
        });

        if (_.isEmpty(mentionedList)) { return; }

        let notificationList = mentionedList.map(idEmployee => {
            return {
                title: '<span><b>' + req.session.employee.fullname + '</b> te mencionó en una solicitud</span>',
                idModelModule: comment.idModelModule,
                modelModule: 'request',
                type: 'Request-Stakeholder',
                assignedTo: idEmployee
            };
        });

        NotificationService.sendNotifications(notificationList);

        async.forEach(mentionedList, (mentioned, cb) => {
            RequestStakeholders.findOrCreate({
                request: comment.idModelModule,
                employee: mentioned.id
            }, {
                    request: comment.idModelModule,
                    employee: mentioned.id
                }).exec(cb);
        }, () => { });
    },
    getTimeline: function (req, res) {
        if (!req.body.id) {
            return res.send({ ok: false });
        }
        Request.subscribe(req, [req.body.id]);

        var getRequestAssignmentLog = function (cb) {
            RequestAssignmentLog
                .find({ request: req.body.id })
                .populate('createdBy')
                .populate('assignedTo')
                .populate('assignedOld')
                .exec(function (err, log) {
                    cb(null, log || []);
                });
        };

        var getComments = function (cb) {
            Comment
                .find({ idModelModule: req.body.id, modelModule: 'request' })
                .populate('createdBy')
                .populate('attachments')
                .exec(function (err, comments) {
                    cb(null, comments || []);
                });
        };

        var getRequestStateLog = function (cb) {
            RequestStateLog
                .find({ request: req.body.id })
                .populate('createdBy')
                .populate('state')
                .exec(function (err, log) {
                    cb(null, log || []);
                });
        };

        var getRequestUnitAssignmentLog = function (cb) {
            RequestUnitAssignmentLog
                .find({ request: req.body.id })
                .populate('createdBy')
                .populate('assignedTo')
                .populate('assignedOld')
                .exec(function (err, log) {
                    cb(null, log || []);
                });
        };

        var getRequestLog = function (cb) {
            RequestLog
                .find({ request: req.body.id })
                .populate('createdBy')
                .populate('label')
                .exec(function (err, log) {
                    cb(null, log || []);
                });
        };

        var getRequestStakeholdersLog = function (cb) {
            RequestStakeholdersLog
                .find({ request: req.body.id })
                .populate('createdBy')
                .populate('employee')
                .exec(function (err, log) {
                    cb(null, log || []);
                });
        };

        async.parallel({
            assignmentLog: getRequestAssignmentLog,
            comments: getComments,
            stateLog: getRequestStateLog,
            unitAssignmentLog: getRequestUnitAssignmentLog,
            requestLog: getRequestLog,
            stakeholdersLog: getRequestStakeholdersLog
        },
            function (err, results) {
                if (err) {
                    sails.log(err);
                    return res.send({ ok: false, msg: '', obj: '' });
                } else {
                    return res.send({ ok: true, msg: '', obj: results });
                }
            });
    },
    setLabel: function (req, res) {

        var createLog = function (request) {
            RequestLog
                .create({
                    request: request.id,
                    createdBy: req.session.employee.id,
                    label: request.label,
                    type: 'label'
                })
                .exec(function (err, log) {
                    Request.message(request.id, {
                        message: 'request:new-label',
                        data: {
                            request: request.id,
                            createdBy: req.session.employee,
                            type: 'label',
                            label: req.body.label,
                            createdAt: log.createdAt
                        }
                    });
                });
        };
        Request.update({
            id: req.body.id
        }, {
                label: req.body.label
            }).exec(function (err, requests) {
                if (err || _.isEmpty(requests)) {
                    sails.log(err);
                    return res.send({ msg: 'REQUEST.ERROR.UPDATE', ok: false, obj: { error: err } });
                } else {
                    sails.log(requests);
                    createLog(requests[0]);
                    RequestNotificationService.sendLabelNotification({
                        sender: _.pick(req.session.employee, ['id', 'fullname']),
                        request: req.body.id,
                        label: req.body.label || {}
                    });
                    return res.send({ msg: 'REQUEST.SUCCESS.UPDATE', ok: true });
                }
            });
    },
    setEmployeeAssigned: function (req, res) {

        var oldEmployeeAssigned = req.body.oldEmployeeAssigned || {};
        var newEmployeeAssigned = req.body.newEmployeeAssigned;
        var maintainAsStakeholder = req.body.maintainAsStakeholder;
        var idRequest = req.body.id;
        var comment = req.body.comment;

        var createLog = function (request) {
            RequestAssignmentLog
                .create({
                    request: request.id,
                    createdBy: req.session.employee.id,
                    assignedTo: request.employeeAssigned,
                    assignedOld: oldEmployeeAssigned.id,
                    comment: comment
                })
                .exec(function (err, log) {
                    if (err || !log) {
                        return;
                    }
                    Request.message(request.id, {
                        message: 'request:new-employeeAssigned',
                        data: {
                            request: request.id,
                            createdBy: _.pick(req.session.employee, ['id', 'fullname']),
                            type: 'employeeAssigned',
                            assignedTo: newEmployeeAssigned,
                            assignedOld: oldEmployeeAssigned,
                            comment: comment,
                            createdAt: log.createdAt
                        }
                    });
                });
        };

        var updateStakeholders = () => {

            var oldAssignedUpdate = (cb) => {
                if (!_.isEmpty(oldEmployeeAssigned)) {
                    RequestStakeholders.update({
                        request: idRequest,
                        employee: oldEmployeeAssigned.id,
                        role: 'assigned'
                    }, {
                            deleted: !maintainAsStakeholder,
                            role: 'other'
                        }).exec(function (err, requestStakeholders) {
                            if (err || _.isEmpty(requestStakeholders)) {
                                sails.log('Error eliminando stakeholder', err);
                                return cb(err);
                            }
                            var requestStakeholder = requestStakeholders[0];
                            if (maintainAsStakeholder) {
                                Request.message(idRequest, {
                                    message: 'request:stakeholder-updated',
                                    data: {
                                        requestStakeholder: requestStakeholder,
                                        request: requestStakeholder.request,
                                        id: requestStakeholder.id,
                                        role: requestStakeholder.role,
                                        employee: oldEmployeeAssigned,
                                        createdBy: _.pick(req.session.employee, ['id', 'fullname']),
                                        timeline: false
                                    }
                                });
                            } else {
                                Request.message(idRequest, {
                                    message: 'request:stakeholder-removed',
                                    data: {
                                        request: requestStakeholder.request,
                                        id: requestStakeholder.id,
                                        employee: oldEmployeeAssigned,
                                        role: requestStakeholder.role,
                                        createdBy: _.pick(req.session.employee, ['id', 'fullname']),
                                        timeline: false
                                    }
                                });
                            }
                            cb();
                        });
                } else {
                    cb();
                }
            };

            var newAssignedUpdate = (cb) => {
                // Si existe un nuevo funcionario asignado
                if (newEmployeeAssigned) {
                    // Se busca stakeholder para actualizar o se crea si es necesario
                    RequestStakeholders.findOne({
                        request: idRequest,
                        employee: newEmployeeAssigned.id,
                        role: 'other'
                    }).exec(function (err, requestStakeholder) {
                        if (err) {
                            sails.log('Error buscando nuevo stakeholder');
                            return cb(err);
                        }
                        if (requestStakeholder) {
                            RequestStakeholders.update(requestStakeholder.id, {
                                role: 'assigned',
                                deleted: false,
                                subscribed: true
                            }).exec(function (err, requestStakeholders) {
                                if (err || _.isEmpty(requestStakeholders)) {
                                    sails.log('Error actualizando stakeholder', err);
                                    return cb(err);
                                }
                                requestStakeholder = requestStakeholders[0];
                                Request.message(idRequest, {
                                    message: 'request:stakeholder-updated',
                                    data: {
                                        request: requestStakeholder.request,
                                        id: requestStakeholder.id,
                                        role: requestStakeholder.role,
                                        employee: _.pick(newEmployeeAssigned, ['id', 'fullname']),
                                        createdBy: _.pick(req.session.employee, ['id', 'fullname']),
                                        timeline: false,
                                        createdAt: requestStakeholder.createdAt
                                    }
                                });
                                cb(null, '');
                            });
                        } else {
                            RequestStakeholders.create({
                                request: idRequest,
                                employee: newEmployeeAssigned.id,
                                role: 'assigned',
                                subscribed: true
                            }).exec(function (err, requestStakeholder) {
                                if (err || !requestStakeholder) {
                                    sails.log('Error creando stakeholder', err);
                                    cb(err);
                                }
                                Request.message(idRequest, {
                                    message: 'request:stakeholder-added',
                                    data: {
                                        request: requestStakeholder.request,
                                        id: requestStakeholder.id,
                                        role: requestStakeholder.role,
                                        employee: _.pick(newEmployeeAssigned, ['id', 'fullname']),
                                        createdBy: _.pick(req.session.employee, ['id', 'fullname']),
                                        timeline: false,
                                        createdAt: requestStakeholder.createdAt
                                    }
                                });
                                cb(null, '');
                            });
                        }
                    });
                } else {
                    cb(null, '');
                }
            };

            return new Promise((resolve, reject) => {
                async
                    .parallel([
                        oldAssignedUpdate,
                        newAssignedUpdate
                    ], function (err, results) {
                        if (err) {
                            reject();
                        } else {
                            resolve(results);
                        }
                    });

            });
        };

        Request.update({
            id: req.body.id
        }, {
                employeeAssigned: (newEmployeeAssigned) ? newEmployeeAssigned.id : null
            }).exec(function (err, requests) {
                if (err || _.isEmpty(requests)) {
                    sails.log('Error actualizando funcionario asignado de solicitud', err);
                    return res.send({ msg: 'REQUEST.ERROR.UPDATE', ok: false, obj: { error: err } });
                } else {
                    createLog(requests[0]);
                    updateStakeholders().then(
                        (results) => {
                            RequestNotificationService.sendEmployeeAssignmentNotification({
                                sender: _.pick(req.session.employee, ['id', 'fullname']),
                                request: requests[0].id,
                                employeeAssigned: newEmployeeAssigned || {}
                            });
                        },
                        (reason) => {
                            sails.log('Ocurrió un error actualizando los participantes', reason);
                        }
                    );
                    return res.send({ msg: 'REQUEST.SUCCESS.UPDATE', ok: true });
                }
            });
    },
    setUnitAssigned: function (req, res) {

        var idRequest = req.body.id;
        var unitAssigned = req.body.unitAssigned;
        var assignedOld = req.body.assignedOld || {};

        var createLog = function (request) {
            RequestUnitAssignmentLog
                .create({
                    request: request.id,
                    createdBy: req.session.employee.id,
                    assignedTo: request.unitAssigned,
                    assignedOld: assignedOld.id,
                    comment: req.body.comment
                })
                .exec(function (err, log) {
                    Request.message(request.id, {
                        message: 'request:new-unitAssigned',
                        data: {
                            request: request.id,
                            createdBy: req.session.employee,
                            type: 'unitAssigned',
                            assignedTo: req.body.unitAssigned,
                            assignedOld: assignedOld,
                            comment: req.body.comment,
                            createdAt: log.createdAt
                        }
                    });
                });
        };

        var updateStakeholders = function () {
            RequestStakeholders.update({
                request: idRequest,
                role: 'assigned',
                deleted: false
            }, {
                    deleted: true
                }).exec(function (err, requestStakeholders) {
                    RequestNotificationService.sendUnitAssignmentNotification({
                        sender: _.pick(req.session.employee, ['id', 'fullname']),
                        request: idRequest,
                        unitAssigned: unitAssigned || {}
                    });
                    if (err || _.isEmpty(requestStakeholders)) {
                        return sails.log('Error actualizando stakeholder', err);
                    }
                    var requestStakeholder = requestStakeholders[0];
                    Request.message(idRequest, {
                        message: 'request:stakeholder-deleted',
                        data: requestStakeholder
                    });
                });
        };

        Request.update({
            id: idRequest
        }, {
                unitAssigned: unitAssigned.id,
                employeeAssigned: null
            }).exec(function (err, requests) {
                if (err || _.isEmpty(requests)) {
                    sails.log(err);
                    return res.send({ msg: 'REQUEST.ERROR.UPDATE', ok: false, obj: { error: err } });
                } else {
                    createLog(requests[0]);
                    updateStakeholders();
                    return res.send({ msg: 'REQUEST.SUCCESS.UPDATE', ok: true });
                }
            });
    },
    setDueDate: function (req, res) {
        var createLog = function (request) {
            RequestLog
                .create({
                    request: request.id,
                    createdBy: req.session.employee.id,
                    dueDate: req.body.dueDate,
                    type: 'dueDate'
                })
                .exec(function (err, log) {
                    Request.message(request.id, {
                        message: 'request:new-dueDate',
                        data: {
                            request: request.id,
                            createdBy: req.session.employee,
                            type: 'dueDate',
                            dueDate: req.body.dueDate,
                            createdAt: log.createdAt
                        }
                    });
                });
        };
        Request.update({
            id: req.body.id
        }, {
                dueDate: req.body.dueDate
            }).exec(function (err, requests) {
                if (err || _.isEmpty(requests)) {
                    sails.log(err);
                    return res.send({ msg: 'REQUEST.ERROR.UPDATE', ok: false, obj: { error: err } });
                } else {
                    sails.log(requests);
                    createLog(requests[0]);
                    RequestNotificationService.sendDueDateNotification({
                        sender: _.pick(req.session.employee, ['id', 'fullname']),
                        request: req.body.id,
                        dueDate: req.body.dueDate
                    });
                    return res.send({ msg: 'REQUEST.SUCCESS.UPDATE', ok: true });
                }
            });
    },
    setState: function (req, res) {

        var createLog = function (request) {
            RequestStateLog
                .create({
                    request: request.id,
                    createdBy: req.session.employee.id,
                    state: request.state
                })
                .exec(function (err, log) {
                    Request.message(request.id, {
                        message: 'request:new-state',
                        data: {
                            request: request.id,
                            createdBy: req.session.employee,
                            type: 'stateChanged',
                            state: req.body.state,
                            createdAt: log.createdAt
                        }
                    });
                });
        };

        Request.update({
            id: req.body.id
        }, {
                state: req.body.state.id
            }).exec(function (err, requests) {
                if (err || _.isEmpty(requests)) {
                    sails.log(err);
                    return res.send({ msg: 'REQUEST.ERROR.UPDATE', ok: false, obj: { error: err } });
                } else {
                    createLog(requests[0]);
                    RequestNotificationService.sendStatusNotification({
                        sender: _.pick(req.session.employee, ['id', 'fullname']),
                        request: req.body.id,
                        status: req.body.state
                    });
                    return res.send({ msg: 'REQUEST.SUCCESS.UPDATE', ok: true });
                }
            });
    },
    getLabels: function (req, res) {
        RequestLabel
            .find({
                deleted: false
            })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'REQUEST.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'REQUEST.SEARCH.FOUND', obj: data });
                }
            });
    },
    getStates: function (req, res) {
        RequestState
            .find({
                deleted: false
            })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'REQUEST.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'REQUEST.SEARCH.FOUND', obj: data });
                }
            });
    },
    getSupervised: function (req, res) {
        var moment = require('moment');
        var page = req.body.page || 1;
        /**
         * Filter
         *  finished        : boolean,
            searchText      : string,
            createdBy       : object,
            employeeAssigned: object,
            supervisedUnits : array,
            minDate         : date,
            maxDate         : date
         */
        var filter = req.body.filter || {};
        var getStateRequest = function (cb) {
            RequestState
                .find({
                    deleted: false,
                    finished: filter.finished
                })
                .exec(function (err, state) {
                    if (state.length > 0) {
                        cb(null, _.map(state, 'id'));
                    } else {
                        cb(null, []);
                    }
                });
        };

        var getSupervisedUnits = function (cb) {
            var criteriaSupervisedUnits = !_.isEmpty(filter.supervisedUnits) ? {
                id: filter.supervisedUnits
            } : null;
            Employee.findOne({
                id: req.session.employee.id
            }).populate('supervisedUnits', criteriaSupervisedUnits)
                .exec(function (err, data) {
                    if (data && data.supervisedUnits.length > 0) {
                        cb(null, _.map(data.supervisedUnits, 'id'));
                    } else {
                        cb(null, []);
                    }
                });
        };

        async.parallel({
            status: getStateRequest,
            supervisedUnits: getSupervisedUnits
        }, function (err, results) {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, msg: '', obj: '' });
            } else {
                var dynamicQuery = {
                    deleted: false,
                    state: results.status,
                    title: { 'contains': filter.searchText || '' },
                    unitAssigned: results.supervisedUnits
                };
                (filter.createdBy) ? dynamicQuery.createdBy = filter.createdBy.id : null;
                (filter.employeeAssigned) ? dynamicQuery.employeeAssigned = filter.employeeAssigned.id : null;
                // Filtro fecha mínima
                if (filter.minDate) {
                    var minDate = new Date(filter.minDate);
                    minDate.setHours(0, 0, 0, 0);
                    _.merge(dynamicQuery, {
                        createdAt: {
                            '>=': minDate
                        }
                    });
                }
                // Filtro fecha máxima
                if (filter.maxDate) {
                    var maxDate = new Date(filter.maxDate);
                    maxDate.setHours(23, 59, 59, 0);
                    _.merge(dynamicQuery, {
                        createdAt: {
                            '<=': maxDate
                        }
                    });
                }

                async.parallel({
                    count: (cb) => {
                        Request
                            .count(dynamicQuery)
                            .exec(cb);
                    },
                    data: (cb) => {
                        Request.
                            find({
                                where: dynamicQuery,
                                sort: {
                                    updatedAt: 0,
                                    id: 1
                                }
                            })
                            .paginate({ page: page || 1, limit: 15 })
                            .populate('state')
                            .populate('createdBy')
                            .populate('label')
                            .populate('employeeAssigned')
                            .populate('unitAssigned')
                            .exec(function (err, data) {
                                if (err) {
                                    cb(err, null);
                                } else {
                                    moment.locale('es');
                                    var now = moment();
                                    data = _.map(data, function (request) {
                                        request = request.toJSON();
                                        if (request.dueDate) {
                                            var dueDate = moment(request.dueDate);
                                            dueDate.endOf('day');
                                            var diff = now - dueDate;
                                            if (Math.abs(diff) >= 129600000 && Math.abs(diff) <= 172800000) {
                                                if (diff < 1) {
                                                    dueDate = moment((dueDate.unix() - 43200) * 1000);
                                                }
                                            }
                                            if (dueDate > now) {
                                                (filter.createdBy) ? dynamicQuery.createdBy = filter.createdBy.id : null;
                                                (filter.employeeAssigned) ? dynamicQuery.employeeAssigned = filter.employeeAssigned.id : null;
                                                request.dueDateDiff = 'Vence ' + now.to(dueDate);
                                            } else {
                                                request.dueDateDiff = 'Venció ' + now.to(dueDate);
                                            }
                                        }
                                        return request;
                                    });
                                    cb(null, data);
                                }
                            });
                    }
                }, function (err, results) {
                    if (err) {
                        sails.log(err);
                        return res.send({ ok: false, obj: err });
                    } else {
                        return res.send({
                            ok: true,
                            msg: 'REQUEST.SEARCH.FOUND',
                            obj: { requests: results.data || [], count: results.count }
                        });
                    }
                });
            }
        });
    },
    getSubscribed: (req, res) => {
        if (!req.session.employee.id) { return res.send({ ok: false }); }
        var moment = require('moment');
        var page = req.body.page || 1;
        var limit = req.body.limit || 16;
        /**
         * Filter
         *  finished        : boolean,
            searchText      : string,
            createdBy       : object,
            employeeAssigned: object,
            supervisedUnits : array,
            minDate         : date,
            maxDate         : date
        */
        var filter = req.body.filter || {};
        RequestState.find({
            deleted: false,
            finished: filter.finished
        }).exec(function (err, state) {
            if (state.length === 0) {
                return res.send({ ok: false });
            }
            var dynamicQuery = {
                deleted: false,
                state: _.map(state, 'id'),
                title: { 'contains': filter.searchText || '' }
            };
            (filter.createdBy) ? dynamicQuery.createdBy = filter.createdBy.id : null;
            (filter.employeeAssigned) ? dynamicQuery.employeeAssigned = filter.employeeAssigned.id : null;

            // Filtro fecha mínima
            if (filter.minDate) {
                var minDate = new Date(filter.minDate);
                minDate.setHours(0, 0, 0, 0);
                _.merge(dynamicQuery, {
                    createdAt: {
                        '>=': minDate
                    }
                });
            }
            // Filtro fecha máxima
            if (filter.maxDate) {
                var maxDate = new Date(filter.maxDate);
                maxDate.setHours(23, 59, 59, 0);
                _.merge(dynamicQuery, {
                    createdAt: {
                        '<=': maxDate
                    }
                });
            }
            async.parallel({
                count: cb => {
                    Employee
                        .findOne(req.session.employee.id)
                        .populate('subscribedrequests', {
                            where: dynamicQuery,
                            sort: {
                                updatedAt: 0,
                                id: 1
                            }
                        }).then(employee => {
                            cb(null, employee.subscribedrequests.length);
                        }, err => cb(err));
                },
                requests: cb => {
                    Employee
                        .findOne(req.session.employee.id)
                        .populate('subscribedrequests', {
                            where: dynamicQuery,
                            skip: (page - 1) * limit,
                            limit: limit,
                            sort: {
                                updatedAt: 0,
                                id: 1
                            }
                        }).then(employee => {
                            Request
                                .find({
                                    where: { id: _.map(employee.subscribedrequests, 'id') },
                                    sort: {
                                        updatedAt: 0,
                                        id: 1
                                    }
                                })
                                .populate('state')
                                .populate('createdBy')
                                .populate('label')
                                .populate('employeeAssigned')
                                .populate('unitAssigned')
                                .exec((err, data) => {
                                    if (err) {
                                        cb(err, null);
                                    } else {
                                        moment.locale('es');
                                        var now = moment();
                                        data = _.map(data, function (request) {
                                            request = request.toJSON();
                                            if (request.dueDate) {
                                                var dueDate = moment(request.dueDate);
                                                dueDate.endOf('day');
                                                var diff = now - dueDate;
                                                if (Math.abs(diff) >= 129600000 && Math.abs(diff) <= 172800000) {
                                                    if (diff < 1) {
                                                        dueDate = moment((dueDate.unix() - 43200) * 1000);
                                                    }
                                                }
                                                if (dueDate > now) {
                                                    (filter.createdBy) ? dynamicQuery.createdBy = filter.createdBy.id : null;
                                                    (filter.employeeAssigned) ? dynamicQuery.employeeAssigned = filter.employeeAssigned.id : null;
                                                    request.dueDateDiff = 'Vence ' + now.to(dueDate);
                                                } else {
                                                    request.dueDateDiff = 'Venció ' + now.to(dueDate);
                                                }
                                            }
                                            return request;
                                        });
                                        cb(null, data);
                                    }
                                });
                        });
                }
            }, (err, results) => {
                if (err) { return res.send({ ok: false }) }
                res.send({
                    ok: true,
                    obj: {
                        count: results.count,
                        requests: results.requests
                    }
                });
            });
        });
    },
    unsubscribe: function (req, res) {
        Request.unsubscribe(req, req.body.id);
    },
    canAutoassign: function (req, res) {
        if (!req.session.employee.unit) { return res.send({ ok: false }) }
        Unit
            .findOne(req.session.employee.unit)
            .populate('parent')
            .exec(function (err, unit) {
                if (err || !unit) {
                    return res.send({ ok: false, msg: '', obj: err });
                } else if (unit.requestType || (unit.parent && unit.parent.requestType)) {
                    return res.send({ ok: true, msg: '', obj: err });
                } else {
                    return res.send({ ok: false, msg: '', obj: err });
                }
            });
    },
    setCommentCount: function (req, res) {
        Request
            .find({ deleted: false })
            .populate('comments')
            .then(requests => {
                async.each(requests, function (request, cb) {
                    request.commentCount = request.comments.length;
                    request.save(cb);
                }, function (err) {
                    if (err) {
                        console.log('Error procesando una solicitud');
                        res.send('Error procesando una solicitud')
                    } else {
                        console.log('Solicitudes actualizadas correctamente');
                        res.send('Solicitudes actualizadas correctamente');
                    }
                });
            })
    },
    getPopularTags: (req, res) => {
        let { searchText } = req.body;
        RequestTag.find({ name: { startsWith: searchText || '' } })
            .limit(10).sort('counter DESC')
            .then(tags => res.send({ ok: true, obj: tags }))
            .catch(err => res.send({ ok: false, obj: err }));
    }
};

