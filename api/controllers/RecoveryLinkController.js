/**
 * RecoveryLinkController
 *
 * @description :: Server-side logic for managing recovery links
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    create: function (req, res) {
        var moment = require('moment');
        var rut = req.body.rut;
        if (!rut) return res.send({ ok: false, msg: 'RECOVERY.ERROR.NODATA' });
        Employee
            .findOne({ rut: rut })
            .exec(function (err, employee) {
                if (err || !employee) return res.send({ ok: false, msg: 'RECOVERY.ERROR.USER-NOTFOUND' });
                RecoveryLink.findOrCreate({
                    employee: employee.id,
                    createdAt: {
                        '>': moment().add('days', -1).toDate()
                    },
                    active: true
                }, { employee: employee.id }).exec(function (err, recovery) {
                    if (err || !recovery) {
                        return res.send({ ok: false, msg: 'RECOVERY.ERROR.KEY-NOTFOUND' });
                    }

                    let emailToSend;

                    if (employee.email && employee.email.includes('@redsalud')) {
                        emailToSend = employee.email;
                    } else if (employee.personalEmail && employee.personalEmail.includes('@redsalud')) {
                        emailToSend = employee.personalEmail;
                    } else {
                        emailToSend = employee.email || employee.personalEmail;
                    }

                    if (!emailToSend) {
                        return res.send({ ok: false, msg: 'RECOVERY.ERROR.MAIL-NOTFOUND' });
                    }

                    employee.email = emailToSend;
                    EmailService.sendRecovery(employee, recovery, 'default');

                    let emailParts = emailToSend.split('@');

                    return res.send({
                        ok: true, msg: 'RECOVERY.SUCCESS.EMAIL', obj: {
                            mail: emailParts[0].substr(0, 3) + emailParts[0].slice(4).replace(/./g, '*') + '@' + emailParts[1]
                        }
                    });
                });
            });
    },
    validate: function (req, res) {
        var moment = require('moment');
        var key = req.body.key;
        if (!key) return res.send({ ok: false, msg: 'RECOVERY.ERROR.NODATA' });
        RecoveryLink
            .findOne({
                key: key,
                active: true,
                createdAt: {
                    '>': moment().add('days', -1).toDate()
                }
            }).exec(function (err, recovery) {
                if (err || !recovery) {
                    return res.send({ ok: false, msg: 'RECOVERY.ERROR.ERROR' });
                }
                return res.send({ ok: true, msg: 'RECOVERY.SUCCESS.FOUND' });
            });
    },
    use: function (req, res) {
        var bcrypt = require('bcrypt');
        var moment = require('moment');
        var key = req.body.key;
        var pass = req.body.pass;

        if (!key || !pass) return res.send({ ok: false, msg: 'RECOVERY.ERROR' });

        //Validar magic link
        RecoveryLink
            .findOne({
                key: key,
                active: true,
                createdAt: {
                    '>': moment().add('days', -1).toDate()
                }
            })
            .exec(function (err, recoveryLink) {

                if (err || !recoveryLink) return res.send({ ok: false, msg: 'RECOVERY.ERROR' });

                //Encriptar contraseña
                bcrypt.hash(pass, 10, function (err, password) {
                    if (err || !password) return res.send({ ok: false, msg: 'RECOVERY.ERROR' });
                    //Cambiar contraseña
                    Employee.update(recoveryLink.employee, {
                        password: password,
                        blockedLogin: false,
                        loginAttempts: 0,
                        lastAttemptToLogin: null
                    }).exec(function (err, employee) {
                        if (err || _.isEmpty(employee)) return res.send({ ok: false, msg: 'RECOVERY.ERROR' });
                        //Invalidar link usado
                        RecoveryLink
                            .update(recoveryLink.id, { active: false })
                            .exec(function (err, recoveryLink) { });
                        return res.send({ ok: true, msg: 'RECOVERY.SUCCESS' });
                    });
                });
            });
    }
};

