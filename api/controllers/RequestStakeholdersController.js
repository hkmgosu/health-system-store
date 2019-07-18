/**
 * RequestStakeholdersController
 *
 * @description :: Server-side logic for managing RequestLabels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    get: function (req, res) {
        if (!_.has(req.body, 'request')) {
            return res.send({ ok: false, obj: {} });
        }
        RequestStakeholders
            .find({
                request: req.body.request,
                deleted: false
            })
            .populate('employee')
            .exec(function (err, results) {
                if (err) {
                    return res.send({
                        ok: false,
                        obj: err
                    });
                }
                return res.send({
                    ok: true,
                    obj: results
                });
            });
    },
    setSubscribed: function (req, res) {

        var request = req.body.request;
        var employee = _.pick(req.session.employee, ['id', 'fullname']);
        var subscribed = req.body.subscribed;

        /**
         * Si existe el participante se modifica su campo de suscripción
         * Si no, se agrega como un nuevo participante
         */
        RequestStakeholders
            .update({
                request: request,
                employee: employee.id,
                deleted: false
            }, {
                    subscribed: subscribed
                })
            .exec(function (err, results) {
                if (err) {
                    return res.send({
                        ok: false,
                        obj: err
                    });
                }
                if (_.isEmpty(results)) {
                    RequestStakeholders
                        .create({
                            employee: employee.id,
                            request: request
                        })
                        .exec(function (err, requestStakeholder) {
                            if (err) {
                                return res.send({
                                    ok: false,
                                    obj: err
                                });
                            }
                            Request.message(requestStakeholder.request, {
                                message: 'request:stakeholder-added',
                                data: _.extend(requestStakeholder, { employee: employee })
                            });
                            return res.send({
                                ok: true,
                                obj: _.extend(requestStakeholder, { employee: employee })
                            });
                        });

                } else {
                    results.forEach(function (requestStakeholder) {
                        Request.message(requestStakeholder.request, {
                            message: 'request:stakeholder-updated',
                            data: _.extend(requestStakeholder, {
                                employee: employee,
                                timeline: false
                            })
                        });
                    }, this);
                    return res.send({
                        ok: true,
                        obj: results
                    });
                }
            });
    },
    addStakeholder: function (req, res) {
        var request = req.body.request;
        var employee = req.body.employee;

        var createLog = (requestStakeholder) => {
            RequestStakeholdersLog
                .create({
                    request: requestStakeholder.request,
                    employee: requestStakeholder.employee,
                    createdBy: req.session.employee.id,
                    type: 'stakeholder:added'
                })
                .exec(function (err, log) {
                    if (err || !log) {
                        return;
                    }
                    Request.message(requestStakeholder.request, {
                        message: 'request:stakeholder-added',
                        data: {
                            request: requestStakeholder.request,
                            id: requestStakeholder.id,
                            role: requestStakeholder.role,
                            employee: employee,
                            createdBy: _.pick(req.session.employee, 'id', 'fullname'),
                            type: 'stakeholder:added',
                            timeline: true,
                            createdAt: log.createdAt
                        }
                    });
                });
        };

        RequestStakeholders.create({
            request: request,
            employee: employee.id,
            createdBy: req.session.employee.id
        }).exec(function (err, requestStakeholder) {
            if (err) {
                return res.send({
                    ok: false,
                    obj: {}
                });
            }
            createLog(requestStakeholder);
            RequestNotificationService.sendStakeholderAddedNotification({
                sender: _.pick(req.session.employee, ['id', 'fullname']),
                request: request,
                stakeholder: employee
            });
            return res.send({
                ok: true,
                obj: requestStakeholder
            });
        });
    },
    rmStakeholder: function (req, res) {
        var requestStakeholder = req.body.requestStakeholder;

        var createLog = () => {
            RequestStakeholdersLog
                .create({
                    request: requestStakeholder.request,
                    employee: requestStakeholder.employee.id,
                    createdBy: req.session.employee.id,
                    type: 'stakeholder:removed'
                })
                .exec(function (err, log) {
                    if (err || !log) {
                        return;
                    }
                    Request.message(requestStakeholder.request, {
                        message: 'request:stakeholder-removed',
                        data: {
                            request: requestStakeholder.request,
                            id: requestStakeholder.id,
                            employee: _.pick(requestStakeholder.employee, ['id', 'fullname']),
                            createdBy: _.pick(req.session.employee, ['id', 'fullname']),
                            type: 'stakeholder:removed',
                            timeline: true,
                            createdAt: log.createdAt
                        }
                    });
                });
        };

        RequestStakeholders.update({
            id: requestStakeholder.id
        }, {
                deleted: true,
            }).exec(function (err, requestStakeholderUpdated) {
                if (err || _.isEmpty(requestStakeholderUpdated)) {
                    return res.send({
                        ok: false,
                        obj: {}
                    });
                }
                createLog();
                RequestNotificationService.sendStakeholderRemovedNotification({
                    sender: _.pick(req.session.employee, ['id', 'fullname']),
                    request: requestStakeholder.request,
                    stakeholder: requestStakeholder.employee
                });
                return res.send({
                    ok: true,
                    obj: {}
                });
            });
    }
};