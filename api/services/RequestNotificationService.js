/* global sails */

// RequestNotificationService.js - in api/services

'use strict';

/**
 * Este método retorna la concatenación de los stakeholders de la solicitud
 * juntos a los supervisores de la unidad a la que está asignada si es necesario
 *
 * options: {
 *  idSender: Obligatorio
 *  idRequest: Obligatorio
 *  includeSupervisors: Opcional
 * }
 */
const getReceivers = (options = {}) => {
    return new Promise( (resolve, reject) => {
        if(!options.idRequest || !options.idSender){
            return reject('Bad Request');
        }
        async.parallel({
            stakeholders: cb => {
                RequestStakeholders.find({
                    employee: {
                        '!': options.idSender
                    },
                    request: options.idRequest,
                    subscribed: true,
                    deleted: false
                })
                .populate('employee')
                .populate('request')
                .exec(cb);
            },
            supervisors: cb => {
                if(!options.includeSupervisors){
                    return async.setImmediate(() => cb(null, []));
                }
                Request
                .findOne(options.idRequest)
                .then(
                    request => {
                        if(!request.unitAssigned){
                            return cb(null, []);
                        }
                        Unit
                            .findOne(request.unitAssigned)
                            .populate('supervisors', {deleted: false, id: {'!': options.idSender}})
                            .exec(
                                (err, unit) => {
                                    let stakeholders = [];
                                    if(unit){
                                        // Mapeo para que los resultados se comporten como stakeholders
                                        unit.supervisors.forEach( supervisor => stakeholders.push({
                                            employee: supervisor,
                                            role: 'other',
                                            request: request
                                        }));
                                    }
                                    return cb(err, stakeholders);
                                }
                            );
                    },
                    err => cb(err)
                );
            }
        }, (err, results) => {
            if(err){
                reject(err);
            } else{
                let receivers = _.uniq( _.union(results.stakeholders, results.supervisors), e => e.employee.id);
                if(_.isEmpty(receivers)){
                    reject('Empty list');
                } else{
                    resolve(receivers);
                }
            }
        });
    });
};

const sendNotifications = (notifications) => {
    NotificationService.sendNotifications(notifications);
};

_.templateSettings = {
    'interpolate': /{{([\s\S]+?)}}/g
};

module.exports = {
    /**
     *
     * @param {type} options
     * @returns {undefined}
     */
    sendCommentNotification: function (opts) {
        _.defaults(opts, {
            sender: {}, //{}
            comment: ''
        });
        var messages = [
            { role: 'owner',    title: '<b>{{sender}}</b> comentó en una solicitud creada por ti' },
            { role: 'assigned', title: '<b>{{sender}}</b> comentó en una solicitud asignada a ti' },
            { role: 'other',    title: '<b>{{sender}}</b> comentó en una solicitud donde participas' }
        ];
        var getTitle = (role) => {
            return _.template( _.find(messages, {role: role}).title, {
                sender: opts.sender.fullname,
                assigned: opts.comment
            });
        };
        getReceivers({
            idSender: opts.sender.id,
            idRequest: opts.request
        }).then(requestStakeholders => {
            var notifications = [];
            var mails = [];
            requestStakeholders.forEach(function(requestStakeholder){
                var title = getTitle(requestStakeholder.role);
                notifications.push({
                    title: title,
                    modelModule: 'request',
                    idModelModule: opts.request,
                    type: 'Comment',
                    assignedTo: requestStakeholder.employee.id
                });

                if(requestStakeholder.employee.email){
                    mails.push({
                        employee: requestStakeholder.employee,
                        requestId: opts.request,
                        title: 'Nuevo comentario',
                        description: title,
                        type: 'default',
                        request: requestStakeholder.request,
                        sender: opts.sender.fullname,
                        comment: opts.comment
                    });
                }
            });
            sendNotifications(notifications);
            EmailService.sendRequestCommentNotification(mails);
        }).catch((err) =>{
            sails.log('Error obteniendo participantes de solicitud', err);
        });
    },
    sendStatusNotification: function(opts){

        _.defaults(opts, {
            sender: {}, //{}
            status: {}
        });
        var messages = [
            { role: 'owner',    title: '<b>{{sender}}</b> cambió el estado a <b>{{assigned}}</b> en una solicitud creada por ti' },
            { role: 'assigned', title: '<b>{{sender}}</b> cambió el estado a <b>{{assigned}}</b> en una solicitud asignada a ti' },
            { role: 'other',    title: '<b>{{sender}}</b> cambió el estado a <b>{{assigned}}</b> en una solicitud donde participas' }
        ];
        var getTitle = (role) => {
            return _.template( _.find(messages, {role: role}).title, {
                sender: opts.sender.fullname,
                assigned: opts.status.description
            });
        };
        getReceivers({
            idSender: opts.sender.id,
            idRequest: opts.request,
            includeSupervisors: true
        }) .then(requestStakeholders => {
            var notifications = [];
            var mails = [];
            requestStakeholders.forEach(function(requestStakeholder){
                var title = getTitle(requestStakeholder.role);
                notifications.push({
                    title: title,
                    modelModule: 'request',
                    idModelModule: opts.request,
                    type: 'Request-State',
                    assignedTo: requestStakeholder.employee.id
                });
                if(requestStakeholder.employee.email){
                    mails.push({
                        employee: requestStakeholder.employee,
                        requestId: opts.request,
                        title: 'Actualización de Solicitud',
                        description: title,
                        type: 'default',
                        request: requestStakeholder.request,
                        sender: opts.sender.fullname
                    });
                }
            });
            sendNotifications(notifications);
            EmailService.sendRequestNotification(mails);
        }).catch((err) =>{
            sails.log('Error obteniendo participantes de solicitud', err);
        });
    },
    sendEmployeeAssignmentNotification: function(opts){
        _.defaults(opts, {
            sender: {}, //{}
            employeeAssigned: {}
        });
        var messages = [
            { role: 'owner',    title: '<b>{{sender}}</b> asignó a <b>{{assigned}}</b> una solicitud creada por ti' },
            { role: 'assigned', title: '<b>{{sender}}</b> te asignó una solicitud' },
            { role: 'other',    title: '<b>{{sender}}</b> asignó a <b>{{assigned}}</b> una solicitud donde participas' }
        ];
        var getTitle = (role) => {
            return _.template( _.find(messages, {role: role}).title, {
                sender: opts.sender.fullname,
                assigned: opts.employeeAssigned.fullname || '--'
            });
        };
        getReceivers({
            idSender: opts.sender.id,
            idRequest: opts.request
        }).then(requestStakeholders => {
            var notifications = [];
            var mails = [];
            requestStakeholders.forEach(function(requestStakeholder){
                var title = getTitle(requestStakeholder.role);
                notifications.push({
                    title: title,
                    modelModule: 'request',
                    idModelModule: requestStakeholder.request.id,
                    type: 'Request-Employee-Assignment',
                    assignedTo: requestStakeholder.employee.id
                });
                if(requestStakeholder.employee.email){

                    mails.push({
                        employee: requestStakeholder.employee,
                        requestId: opts.request,
                        title: 'Asignación de Solicitud',
                        description: title,
                        type: 'default',
                        request: requestStakeholder.request,
                        sender: opts.sender.fullname
                    });
                }
            });
            sendNotifications(notifications);
            EmailService.sendRequestNotification(mails);
        }).catch((err) =>{
            sails.log('Error obteniendo participantes de solicitud', err);
        });
    },
    sendUnitAssignmentNotification: function(opts){
        _.defaults(opts, {
            sender: {}, // {}
            unitAssigned: {} //
        });
        var messages = [
            { role: 'owner',    title: '<b>{{sender}}</b> derivó a <b>{{assigned}}</b> una solicitud creada por ti' },
            { role: 'assigned', title: '<b>{{sender}}</b> derivó a <b>{{assigned}}</b> una solicitud asignada a ti' },
            { role: 'other',    title: '<b>{{sender}}</b> derivó a <b>{{assigned}}</b> una solicitud' }
        ];
        var getTitle = (role) => {
            return _.template( _.find(messages, {role: role}).title, {
                sender: opts.sender.fullname,
                assigned: opts.unitAssigned.name || '--'
            });
        };
        getReceivers({
            idSender: opts.sender.id,
            idRequest: opts.request,
            includeSupervisors: true
        }).then(receivers => {
            var notifications = [];
            var mails = [];
            receivers.forEach(function(receiver){
                var title = getTitle(receiver.role);
                notifications.push({
                    title: title,
                    modelModule: 'request',
                    idModelModule: opts.request,
                    type: 'Request-Unit-Assignment',
                    assignedTo: receiver.employee.id
                });
                if(receiver.employee.email){
                    mails.push({
                        employee: receiver.employee,
                        requestId: opts.request,
                        title: 'Derivación de Solicitud',
                        description: title,
                        type: 'default',
                        request: receiver.request,
                        sender: opts.sender.fullname,
                    });
                }
            });
            sendNotifications(notifications);
            EmailService.sendRequestNotification(mails);
        }).catch((err) =>{
            sails.log('Error obteniendo participantes de solicitud', err);
        });
    },
    sendLabelNotification: function(opts){
        _.defaults(opts, {
            sender: {}, // {}
            label: {} //
        });
        var messages = [
            { role: 'owner',    title: '<b>{{sender}}</b> cambió el tipo a <b>{{assigned}}</b> en una solicitud creada por ti' },
            { role: 'assigned', title: '<b>{{sender}}</b> cambió el tipo a <b>{{assigned}}</b> en una solicitud asignada a ti' },
            { role: 'other',    title: '<b>{{sender}}</b> cambió el tipo a <b>{{assigned}}</b> en una solicitud donde participas' }
        ];
        var getTitle = (role) => {
            return _.template( _.find(messages, {role: role}).title, {
                sender: opts.sender.fullname,
                assigned: opts.label.name || '--'
            });
        };
        getReceivers({
            idSender: opts.sender.id,
            idRequest: opts.request
        }).then(requestStakeholders => {
            var notifications = [];
            var mails = [];
            requestStakeholders.forEach(function(requestStakeholder){
                var title = getTitle(requestStakeholder.role);
                notifications.push({
                    title: title,
                    modelModule: 'request',
                    idModelModule: opts.request,
                    type: 'Request-Label',
                    assignedTo: requestStakeholder.employee.id
                });
                if(requestStakeholder.employee.email){
                    mails.push({
                        employee: requestStakeholder.employee,
                        requestId: opts.request,
                        title: 'Actualización de Solicitud',
                        description: title,
                        type: 'default',
                        request: requestStakeholder.request,
                        sender: opts.sender.fullname,
                    });
                }
            });
            sendNotifications(notifications);
            EmailService.sendRequestNotification(mails);
        }).catch((err) =>{
            sails.log('Error obteniendo participantes de solicitud', err);
        });
    },
    sendDueDateNotification: function(opts){
        var moment = require('moment');
        _.defaults(opts, {
            sender: {}, // {}
            dueDate: null // new Date()
        });
        var messages = [
            { role: 'owner',    title: '<b>{{sender}}</b> cambió la fecha de vencimiento al <b>{{assigned}}</b> en una solicitud creada por ti' },
            { role: 'assigned', title: '<b>{{sender}}</b> cambió la fecha de vencimiento al <b>{{assigned}}</b> en una solicitud asignada a ti' },
            { role: 'other',    title: '<b>{{sender}}</b> cambió la fecha de vencimiento al <b>{{assigned}}</b> en una solicitud donde participas' }
        ];
        var getTitle = (role) => {
            return _.template( _.find(messages, {role: role}).title, {
                sender: opts.sender.fullname,
                assigned: moment(opts.dueDate).isValid() ? moment(opts.dueDate).format('DD/MM/Y') : '--'
            });
        };
        getReceivers({
            idSender: opts.sender.id,
            idRequest: opts.request
        }).then(requestStakeholders => {
            var notifications = [];
            var mails = [];
            requestStakeholders.forEach(function(requestStakeholder){
                var title = getTitle(requestStakeholder.role);
                notifications.push({
                    title: title,
                    modelModule: 'request',
                    idModelModule: opts.request,
                    type: 'Request-Due-Date',
                    assignedTo: requestStakeholder.employee.id
                });

                if(requestStakeholder.employee.email){
                    mails.push({
                        employee: requestStakeholder.employee,
                        requestId: opts.request,
                        title: 'Actualización de Solicitud',
                        description: title,
                        type: 'default',
                        request: requestStakeholder.request,
                        sender: opts.sender.fullname,
                        dueDate: opts.dueDate
                    });
                }
            });
            sendNotifications(notifications);
            EmailService.sendRequestNotification(mails);
        }).catch((err) =>{
            sails.log('Error obteniendo participantes de solicitud', err);
        });
    },
    sendStakeholderAddedNotification: function(opts){
        _.defaults(opts, {
            sender: {}, // {}
            stakeholder: {}
        });
        var messages = [
            { role: 'owner',    title: '<b>{{sender}}</b> agregó a <b>{{stakeholder}}</b> como participante en una solicitud creada por ti' },
            { role: 'assigned', title: '<b>{{sender}}</b> agregó a <b>{{stakeholder}}</b> como participante en una solicitud asignada a ti' },
            { role: 'other',    title: '<b>{{sender}}</b> agregó a <b>{{stakeholder}}</b> como participante en una solicitud' }
        ];
        var getTitle = (role) => {
            return _.template( _.find(messages, {role: role}).title, {
                sender: opts.sender.fullname,
                stakeholder: opts.stakeholder.fullname
            });
        };
        getReceivers({
            idSender: opts.sender.id,
            idRequest: opts.request
        }).then(requestStakeholders => {
            var notifications = [];
            var mails = [];
            requestStakeholders.forEach(function(requestStakeholder){
                var title = getTitle(requestStakeholder.role);
                notifications.push({
                    title: title,
                    modelModule: 'request',
                    idModelModule: opts.request,
                    type: 'Request-Stakeholder',
                    assignedTo: requestStakeholder.employee.id
                });

                if(requestStakeholder.employee.email){
                    mails.push({
                        employee: requestStakeholder.employee,
                        requestId: opts.request,
                        title: 'Nuevo participante en solicitud',
                        description: title,
                        type: 'default',
                        request: requestStakeholder.request,
                        sender: opts.sender.fullname
                    });
                }
            });
            sendNotifications(notifications);
            EmailService.sendRequestNotification(mails);
        }).catch((err) =>{
            sails.log('Error obteniendo participantes de solicitud', err);
        });
    },
    sendStakeholderRemovedNotification: function(opts){
        _.defaults(opts, {
            sender: {}, // {}
            stakeholder: {}
        });
        var messages = [
            { role: 'owner',    title: '<b>{{sender}}</b> quitó a <b>{{stakeholder}}</b> como participante en una solicitud creada por ti' },
            { role: 'assigned', title: '<b>{{sender}}</b> quitó a <b>{{stakeholder}}</b> como participante en una solicitud asignada a ti' },
            { role: 'other',    title: '<b>{{sender}}</b> quitó a <b>{{stakeholder}}</b> como participante en una solicitud' }
        ];
        var getTitle = (role) => {
            return _.template( _.find(messages, {role: role}).title, {
                sender: opts.sender.fullname,
                stakeholder: opts.stakeholder.fullname
            });
        };
        getReceivers({
            idSender: opts.sender.id,
            idRequest: opts.request
        }).then(requestStakeholders => {
            var notifications = [];
            var mails = [];
            requestStakeholders.forEach(function(requestStakeholder){
                var title = getTitle(requestStakeholder.role);
                notifications.push({
                    title: title,
                    modelModule: 'request',
                    idModelModule: opts.request,
                    type: 'Request-Stakeholder',
                    assignedTo: requestStakeholder.employee.id
                });

                if(requestStakeholder.employee.email){
                    mails.push({
                        employee: requestStakeholder.employee,
                        requestId: opts.request,
                        title: 'Participante removido',
                        description: title,
                        type: 'default',
                        request: requestStakeholder.request,
                        sender: opts.sender.fullname
                    });
                }
            });
            sendNotifications(notifications);
            EmailService.sendRequestNotification(mails);
        }).catch((err) =>{
            sails.log('Error obteniendo participantes de solicitud', err);
        });
    }
};