/* global sails */

// EmailService.js - in api/services

'use strict';

module.exports = {
    /**
     *
     * @param {type} options
     * @returns {undefined}
     */
    send: function (customOptions) {
        if (sails.config.environment !== 'production') {
            return false;
        }
        var from = customOptions.config.from || sails.config.email.from;
        var defaultOptions = {
            view: 'email/default',
            to: {
                //                email: {},
                //                user : {}
            },
            config: { //valores por defecto para el config o elementos comunes de todas las plantillas 
                layout: 'layout', //ruta relativa al view
                title: 'Mi SSVQ',
                logo: 'http://ssviqui.redsalud.gob.cl/wrdprss_minsal/wp-content/themes/minsal-wp-template/assets/img/header/logo.jpg',
                subject: 'Contacto',
                contact: {
                    phone: '+56 xxxxxxxxx',
                    email: 'contacto@ssvq.cl'
                }
            }
        };
        var options = _.merge({}, defaultOptions, customOptions); //opciones generales
        var config = _.merge({}, options.config); //configuracion especifica por email

        var nodemailer = require('nodemailer');
        var emailify = require('emailify');

        var mailgunTransporter = nodemailer.createTransport(require('nodemailer-mailgun-transport')(sails.config.email.mailgunConfig));
        var outlockTransporter = nodemailer.createTransport(require('nodemailer-smtp-transport')(sails.config.email.ssvqOutlookConfig));

        async.forEach(options.to, receiver => {
            sails.renderView(options.view, _.extend({}, config, receiver), (err, html) => {
                if (err) {
                    return console.log(err);
                }
                var mailOptions = {
                    from: from, // sender address
                    to: receiver.user.email, // list of receivers
                    subject: config.subject, // Subject line
                };
                emailify.parse(html, function (err, cleanHtml) {
                    mailOptions.html = cleanHtml;
                    let transporter;
                    if (!receiver.user.email) return false;
                    if (!receiver.user.email.toLowerCase().includes('@redsalud') && customOptions.mailgun) {
                        transporter = mailgunTransporter;
                    } else if (receiver.user.email.toLowerCase().includes("@redsalud")) {
                        transporter = outlockTransporter;
                    } else {
                        return false;
                    }
                    // envío de correo
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            return sails.log(err);
                        }
                    });
                });
            });
        }, err => {
            sails.log(err);
        });
    },
    sendRecovery: function (user, recovery, type) {
        var path = sails.config.path[type];
        var options = {
            view: 'email/recovery',
            to: [{
                user: {
                    name: user.name,
                    lastname: user.lastname,
                    email: user.email
                },
                email: {
                    title: 'Recuperación de contraseña',
                    description: 'El siguiente enlace te permite recuperar la contraseña',
                    body: '<a href="' + path + '#/recovery/' + recovery.key + '">Recuperar contraseña</a>'
                }
            }],
            config: {
                layout: 'layout',
                title: 'Mi SSVQ',
                subject: 'Recuperación de contraseña',
                contact: {
                    phone: '+56 xxxxxxxxx',
                    email: 'contacto@ssvq.cl'
                }
            },
            mailgun: true
        };
        this.send(options);
    },
    sendRequestNotification: function (mails) {
        //employee, requestId, title, description, type, request, sender
        mails.forEach(function (element) {
            var path = sails.config.path['default'];
            var options = {
                view: 'email/notification',
                to: [{
                    user: {
                        name: element.employee.name,
                        lastname: element.employee.lastname,
                        email: element.employee.email
                    },
                    email: {
                        title: element.title,
                        description: element.description,
                        body: '<a href="' + path + '#/solicitudes/detalles/' + element.requestId + '">Ir a la solicitud</a>',
                        request: element.request
                    }
                }],
                config: {
                    from: '"' + element.sender + '" <mi.ssvq@redsalud.gov.cl>',
                    layout: 'layout',
                    title: 'Mi SSVQ',
                    subject: element.title,
                    contact: {
                        phone: '+56 xxxxxxxxx',
                        email: 'contacto@ssvq.cl'
                    }
                }
            };
            this.send(options);
        }, this);
    },
    sendRequestCommentNotification: function (mails) {
        //employee, requestId, title, description, type, request, sender, comment) {
        mails.forEach(function (element) {
            var path = sails.config.path[element.type];
            var options = {
                view: 'email/comment-notification',
                to: [{
                    user: {
                        name: element.employee.name,
                        lastname: element.employee.lastname,
                        email: element.employee.email
                    },
                    email: {
                        title: element.title,
                        description: element.description,
                        body: '<a href="' + path + '#/solicitudes/detalles/' + element.requestId + '">Ir a la solicitud</a>',
                        request: element.request,
                        comment: element.comment
                    }
                }],
                config: {
                    from: '"' + element.sender + '" <mi.ssvq@redsalud.gov.cl>',
                    layout: 'layout',
                    title: 'Mi SSVQ',
                    subject: element.title
                }
            };
            this.send(options);
        }, this);
    },
    sendRequestReminder: function (employee, vencidas, porVencer, title) {
        var path = sails.config.path.default;
        var options = {
            view: 'email/reminder',
            to: [{
                user: {
                    name: employee.name,
                    lastname: employee.lastname,
                    email: employee.email
                },
                email: {
                    vencidas: vencidas,
                    porVencer: porVencer,
                    path: path,
                    title: title
                }
            }],
            config: {
                layout: 'layout',
                title: 'Mi SSVQ',
                subject: 'Recordatorio de Solicitudes',
                contact: {
                    phone: '+56 xxxxxxxxx',
                    email: 'contacto@ssvq.cl'
                }
            }
        };
        this.send(options);
    },
    sendRestartServer: function (processNumber, log) {
        var to = ((sails.config.email || {}).maintanceMails || []).map(mail => { return { user: { email: mail }, log: log }; });
        var options = {
            view: 'email/restart',
            to: to,
            config: {
                layout: 'layout',
                title: 'Mi SSVQ',
                subject: 'Reinicio del servidor Mi SSVQ - instancia ' + processNumber,
            }
        };
        this.send(options);
    },
    sendAdverseEventNotification: function (mails) {
        //employee, requestId, title, description, type, request, sender
        mails.forEach(function (element) {
            var path = sails.config.path['default'];
            var options = {
                view: 'email/adverse-event-notification',
                to: [{
                    user: {
                        name: element.employee.name,
                        lastname: element.employee.lastname,
                        email: element.employee.email
                    },
                    email: {
                        title: element.title,
                        description: element.description,
                        body: '<a href="' + path + '#/eventos-adversos/detalles/' + element.adverseEventId + '">Ir al evento</a>',
                        adverseEvent: element.adverseEvent
                    }
                }],
                config: {
                    from: '"' + element.sender + '" <mi.ssvq@redsalud.gov.cl>',
                    layout: 'layout',
                    title: 'Mi SSVQ',
                    subject: element.title,
                    contact: {
                        phone: '+56 xxxxxxxxx',
                        email: 'contacto@ssvq.cl'
                    }
                }
            };
            this.send(options);
        }, this);
    },
    sendPermissionNotification: function (mails) {
        mails.forEach(function (element) {
            var path = sails.config.path['default'];
            var options = {
                view: 'email/permission-notification',
                to: [
                    {
                        user: {
                            name: element.employee.name,
                            lastname: element.employee.lastname,
                            email: element.employee.email
                        },
                        email: {
                            title: element.title,
                            description: element.description,
                            body: '<a href="' + path + '#/permisos/detalles/' + element.permissionId + '">Ir al permiso</a>',
                            permission: element.permission
                        }
                    }
                ],
                config: {
                    from: '"' + element.sender + '" <mi.ssvq@redsalud.gov.cl>',
                    layout: 'layout',
                    title: 'Mi SSVQ',
                    subject: element.title,
                    contact: {
                        phone: '+56 xxxxxxxxx',
                        email: 'contacto@ssvq.cl'
                    }
                }
            };
            this.send(options);
        }, this);
    },
    sendResourceAssignedNotification: function (employeeAssigned, assignedBy, resource, type) {
        var path = sails.config.path['default'];

        let description = '';
        let subject = '';

        if (type === 'assigned') {
            description = 'ha asociado un recurso con tu cuenta de usuario';
            subject = 'Asignación de recurso';
        } else {
            description = 'ha liberado un recurso que estaba asociado a tu cuenta de usuario';
            subject = 'Liberación de recurso';
        }
        var options = {
            view: 'email/resourceAssigned',
            to: [{
                user: {
                    name: employeeAssigned.name,
                    lastname: employeeAssigned.lastname,
                    email: employeeAssigned.email
                },
                email: {
                    assignedBy: assignedBy,
                    resource: resource,
                    description: description
                }
            }],
            config: {
                from: '"Mi SSVQ" <mi.ssvq@redsalud.gov.cl>',
                layout: 'layout',
                title: 'Mi SSVQ',
                subject: subject
            },
            mailgun: true
        };
        this.send(options);
    },
    sendViaticNotification: function (mails) {
        mails.forEach(function (element) {
            var path = sails.config.path['default'];
            var options = {
                view: 'email/viatic-notification',
                to: [
                    {
                        user: {
                            name: element.employee.name,
                            lastname: element.employee.lastname,
                            email: element.employee.email
                        },
                        email: {
                            title: element.title,
                            description: element.description,
                            body: '<a href="' + path + '#/viaticos/detalles/' + element.viaticId + '">Ir al viático</a>',
                            viatic: element.viatic
                        }
                    }
                ],
                config: {
                    from: '"' + element.sender + '" <mi.ssvq@redsalud.gov.cl>',
                    layout: 'layout',
                    title: 'Mi SSVQ',
                    subject: element.title,
                    contact: {
                        phone: '+56 xxxxxxxxx',
                        email: 'contacto@ssvq.cl'
                    }
                }
            };
            this.send(options);
        }, this);
    },
    sendCriticalStockNotification: function (stocks) {
        sails.log.info("send Critical Stock Notification");
        var path = sails.config.path['default'];
        var options = {
            view: 'email/stock-notification',
            to: [{
                user: {
                    name: "Vladimir",
                    lastname: "Esparza",
                    email: "vladimir.esparzav@redsalud.gob.cl"
                },
                email: {
                    title: 'Stock Crítico',
                    description: 'Notificación de ',
                    body: '<a href="' + path + '#/bodega/reporte-stock-critico">ir al reporte</a>',
                    stocks
                }
            }],
            config: {
                from: '"Mi SSVQ" <mi.ssvq@redsalud.gov.cl>',
                layout: 'layout',
                title: 'Mi SSVQ',
                subject: 'Stock Crítico'
            }
        }
        this.send(options);
    }
};