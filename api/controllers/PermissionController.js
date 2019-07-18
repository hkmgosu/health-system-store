/**
 * PermissionController
 *
 * @description :: Server-side logic for managing permissions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    create: (req, res) => {
        var permission = req.body.permission;

        var getDurationText = (permission) => {
            let day = _.filter(permission.detailsDay, day => { return (day.value.quantity === 1 && day.value.measure === 'day') }).length;
            let midday = _.filter(permission.detailsDay, day => { return day.value.quantity === 0.5 && day.value.measure === 'day' }).length;
            let hours = _.filter(permission.detailsDay, day => { return day.value.measure === 'hour' }).reduce((total, day) => total + day.value.quantity, 0);
            let hour = parseInt(hours);
            let min = (hours - parseInt(hours)) * 60;

            let durationText = day ? day > 1 ? day + ' días, ' : day + ' día, ' : '';
            durationText = durationText + (midday ? midday > 1 ? midday + ' medios días, ' : midday + ' medio día, ' : '');
            durationText = durationText + (hour > 0 ? hour > 1 ? hour + ' hrs ' : hour + ' hr ' : '');
            durationText = durationText + (min > 0 ? min + ' min' : '');
            durationText = durationText.replace(/, $| $/, '');

            return durationText;
        };

        while (!_.isEmpty(permission.detailsDay) && !_.first(permission.detailsDay).value.quantity) {
            permission.detailsDay.shift();
        }
        while (!_.isEmpty(permission.detailsDay) && !_.last(permission.detailsDay).value.quantity) {
            permission.detailsDay.pop();
        }

        if (_.isEmpty(permission.detailsDay)) { return res.badRequest('No hay días seleccionadoss'); }

        permission.fromDate = _.first(permission.detailsDay).date;
        permission.untilDate = _.last(permission.detailsDay).date;

        permission.duration = getDurationText(permission);

        /* Borro archivos adjuntos sin id */
        if (permission.attachments) {
            _.remove(permission.attachments, (archive) => {
                if (!archive.id) {
                    return archive;
                }
            });
            permission.attachments = _.map(permission.attachments, 'id');
        }

        // Se crea el permiso
        var createPermission = (permission) => {
            Permission.create(_.extend(permission, { owner: req.session.employee.id }))
                // Voy a buscar tipo del permiso
                .then(permissionCreated => { return Permission.findOne(permissionCreated.id).populate('type') })
                .then(permissionCreated => {
                    sendNotifications(permissionCreated);
                    res.ok(permissionCreated)
                })
                .catch(err => {
                    sails.log(err);
                    res.negotiate('Error interno');
                });
        };

        // Se envia notificaciones
        var sendNotifications = permission => {
            EmployeeUnit.find({ unit: permission.unit, role: ['boss', 'surrogateBoss'], deleted: false, employee: { '!': req.session.employee.id } })
                .populate('employee')
                .then(employeeUnit => {
                    var notifications = [];
                    var mails = [];
                    employeeUnit.forEach(register => {
                        if (register.employee.id !== req.session.employee.id) {
                            notifications.push({
                                title: '<span><b>' + req.session.employee.fullname + '</b> envió una solicitud de permiso.</span>',
                                modelModule: 'permission',
                                idModelModule: permission.id,
                                type: 'New-Permission',
                                assignedTo: register.employee.id
                            });
                            mails.push({
                                employee: register.employee,
                                permissionId: permission.id,
                                title: 'Nueva solicitud de permiso',
                                description: '<span><b>' + req.session.employee.fullname + '</b> envió una solicitud de permiso.</span>',
                                type: 'default',
                                permission: permission,
                                sender: req.session.employee.fullname,
                            });
                        }
                    });

                    NotificationService.sendNotifications(notifications);
                    EmailService.sendPermissionNotification(mails);
                })
                .catch(err => sails.log(err));
        };

        (async () => {
            try {
                var unit = await WorkflowService.getReportedUnit(req.session.employee);
                if (unit) permission.unit = unit;
                else { throw new Error('No existe unidad a la cual reportar'); }
                var status = await WorkflowStatus.findOne({
                    module: 'permission',
                    order: 1
                });
                if (status) {
                    permission.status = status.id;
                    permission.statusLog = '.' + status.id + '.';
                }
                permission.status && permission.unit ? createPermission(permission) : res.negotiate('Existe un error en la configuración');
            } catch (err) {
                res.negotiate(err.message);
            };
        })();

    },
    getSent: (req, res) => {
        var page = req.body.page || 1;
        /**
         * Filter
            minDate: date,
            maxDate: date
         */
        var filter = req.body.filter || {};

        var dynamicQuery = {
            deleted: false,
            owner: req.session.employee.id
        };

        if (filter.minDate) {
            var minDate = new Date(filter.minDate);
            minDate.setHours(0, 0, 0, 0);
            _.merge(dynamicQuery, {
                createdAt: {
                    '>=': minDate
                }
            });
        }
        // Filtro fecha máxima de ocurrencia
        if (filter.maxDate) {
            var maxDate = new Date(filter.maxDate);
            maxDate.setHours(23, 59, 59, 0);
            _.merge(dynamicQuery, {
                createdAt: {
                    '<=': maxDate
                }
            });
        }

        // Filtro num correlativo o motivo permiso
        if (filter.searchText) {
            var correlative = parseInt(filter.searchText);
            if (Number.isInteger(correlative)) {
                dynamicQuery.correlativeNumber = correlative;
            } else {
                dynamicQuery.reason = { 'contains': filter.searchText || '' };
            }
        }

        var getPermissionStatus = cb => {
            let filterStatus = { deleted: false, module: 'permission' };
            if (filter.type) filterStatus.type = filter.type;
            WorkflowStatus
                .find(filterStatus)
                .then(status => cb(null, _.map(status, 'id')), cb)
        };

        async.parallel({
            status: getPermissionStatus
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.negotiate({ ok: false, obj: err });
            }

            // Filtro de estado
            if (filter.status && filter.status.length > 0) {
                dynamicQuery.status = _.intersection(results.status, filter.status);
            } else {
                dynamicQuery.status = results.status;
            }

            async.parallel({
                count: (cb) => {
                    Permission
                        .count(dynamicQuery)
                        .exec(cb);
                },
                data: (cb) => {
                    Permission
                        .find({
                            where: dynamicQuery,
                            sort: {
                                updatedAt: 0,
                                id: 1
                            }
                        })
                        .paginate({ page: page || 1, limit: 15 })
                        .populate('owner')
                        .populate('type')
                        .populate('status')
                        .populate('unit')
                        .then(data => cb(null, data))
                        .catch(err => cb(err, null));
                }
            }, (err, results) => {
                if (err) {
                    sails.log(err);
                    return res.negotiate({ ok: false, obj: err });
                } else {
                    return res.ok({ permissions: results.data, count: results.count });
                }
            });
        });
    },
    getDetails: (req, res) => {
        if (!req.body.id) return res.negotiate('No ha ingresdo id de permiso');
        Permission.findOne(req.body.id)
            .populate('owner')
            .populate('type')
            .populate('attachments')
            .populate('status')
            .then(permission => {
                if (!(permission.owner || {}).unit) return res.ok(permission);
                Unit.findOne(permission.owner.unit)
                    .then(unit => {
                        permission.owner.unit = unit;
                        return res.ok(permission);
                    }, err => {
                        sails.log(err);
                        return res.ok(permission);
                    });
            })
            .catch(err => res.negotiate(err));
    },
    getPermissionTypeList: (req, res) => {
        PermissionType.find({ deleted: false }).then(
            permissionTypeList => res.ok(permissionTypeList),
            err => res.negotiate(err)
        );
    },
    initPermissionType: (req, res) => {
        PermissionType.destroy({}).then(() => {
            PermissionType.create([
                { id: 1, name: 'Feriado legal' },
                { id: 2, name: 'Permiso administrativo' },
                { id: 3, name: 'Permiso paternal' },
                { id: 4, name: 'Permiso por fallecimiento' },
                { id: 5, name: 'Tiempo compensatorio' }
            ]).then(permissionTypeList => res.ok(permissionTypeList));
        });
    },
    getSupervised: (req, res) => {
        var page = req.body.page || 1;
        /**
         * Filter
            minDate: date,
            maxDate: date
         */
        var filter = req.body.filter || {};
        var dynamicQuery = { deleted: false };

        //Object.assign(dynamicQuery, filter);

        // Filtro fecha mínima de ocurrencia
        if (filter.minDate) {
            var minDate = new Date(filter.minDate);
            minDate.setHours(0, 0, 0, 0);
            _.merge(dynamicQuery, {
                createdAt: {
                    '>=': minDate
                }
            });
        }
        // Filtro fecha máxima de ocurrencia
        if (filter.maxDate) {
            var maxDate = new Date(filter.maxDate);
            maxDate.setHours(23, 59, 59, 0);
            _.merge(dynamicQuery, {
                createdAt: {
                    '<=': maxDate
                }
            });
        }

        // Filtro de Employee
        filter.createdBy && filter.createdBy.id ? dynamicQuery.owner = filter.createdBy.id : null;

        // Filtro 
        filter.closure === null ? dynamicQuery.closure = null : null;

        // Filtro num correlativo o motivo permiso
        if (filter.searchText) {
            var correlative = parseInt(filter.searchText);
            if (Number.isInteger(correlative)) {
                dynamicQuery.correlativeNumber = correlative;
            } else {
                dynamicQuery.reason = { 'contains': filter.searchText || '' };
            }
        }

        var getPermissionStatus = cb => {
            let filterStatus = { deleted: false, module: 'permission' };
            if (filter.type) filterStatus.type = filter.type;
            if ((filter.status || {}).order) filterStatus.order = filter.status.order;
            WorkflowStatus
                .find(filterStatus)
                .then(status => cb(null, _.map(status, 'id')), cb)
        };

        var getSupervisedPermits = cb => {
            Employee
                .findOne(req.session.employee.id)
                .populate('workflowsSupervisor')
                .then(employee => {
                    if (employee) {
                        EmployeeUnit.find({ employee: employee.id, role: ['boss', 'surrogateBoss'], deleted: false })
                            .then(register => {
                                let orFilter = [];
                                let unitsIds = _.map(register, 'unit');
                                let statusIds = _.map(employee.workflowsSupervisor, 'id');
                                if (unitsIds.length > 0) {
                                    orFilter = orFilter.concat(_.map(unitsIds, id => { return { unit: id } }));
                                }
                                if (statusIds.length > 0) {
                                    orFilter = orFilter.concat(_.map(statusIds, id => { return { status: id } }));
                                    orFilter = orFilter.concat(_.map(statusIds, id => { return { statusLog: { like: '%.' + id + '.%' } } }));
                                }
                                cb(null, orFilter);
                            }, cb)
                    }
                }, cb)
        };

        async.parallel({
            status: getPermissionStatus,
            supervised: getSupervisedPermits
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.negotiate({ ok: false, obj: err });
            }
            dynamicQuery.or = results.supervised;
            if (filter.status && filter.status.length > 0) {
                dynamicQuery.status = _.intersection(results.status, filter.status);
            } else {
                dynamicQuery.status = results.status;
            }
            async.parallel({
                count: (cb) => {
                    Permission
                        .count(dynamicQuery)
                        .exec(cb);
                },
                data: (cb) => {
                    Permission
                        .find({
                            where: dynamicQuery,
                            sort: {
                                updatedAt: 0,
                                id: 1
                            }
                        })
                        .paginate({ page: page || 1, limit: 15 })
                        .populate('owner')
                        .populate('type')
                        .populate('status')
                        .populate('unit')
                        .then(data => cb(null, data))
                        .catch(err => cb(err, null));
                }
            }, (err, results) => {
                if (err) {
                    sails.log(err);
                    return res.negotiate({ ok: false, obj: err });
                } else {
                    return res.ok({ permissions: results.data, count: results.count });
                }
            });
        });
    },
    setStatus: (req, res) => {
        let { idStatus, id, comment } = req.body;
        let idEmployee = req.session.employee.id;

        async.waterfall([
            // Validate
            cb => {
                WorkflowService.getEnabledStatusList(id, 'permission', idEmployee).then(
                    statusList => cb(_.map(statusList, 'id').includes(idStatus) ? null : new Error('Status not enabled')),
                    cb
                );
            },
            // Update
            cb => {
                Permission.findOne(id).populate('owner').then(permission => {
                    if (_.isEmpty(permission)) { return res.badRequest(); }

                    Object.assign(permission, {
                        status: idStatus,
                        statusLog: permission.statusLog + idStatus + '.'
                    });

                    permission.save(err => cb(err, permission));
                }, cb);
            },
            // After Update
            (permissionUpdated, cb) => {

                async.setImmediate(cb);

                WorkflowStatus.findOne(idStatus).populate('supervisors').then(status => {
                    async.parallel({
                        createLog: cb => {
                            PermissionLog.create({
                                createdBy: req.session.employee.id,
                                permission: permissionUpdated.id,
                                type: 'statusChanged',
                                status: idStatus,
                                comment: comment
                            }).exec(cb);
                        },
                        sendNotifications: cb => {
                            // Enviar notificación al creador del permiso
                            let notificationList = [{
                                assignedTo: permissionUpdated.owner.id,
                                modelModule: 'permission',
                                idModelModule: permissionUpdated.id,
                                title: 'Tu solicitud de <b>permiso</b> cambió de estado a <b>' + status.name + '</b>',
                                type: 'Permission-Status'
                            }];

                            // Enviar notificación a los supervisores del nuevo estado
                            status.supervisors.forEach(supervisor => {
                                notificationList.push({
                                    assignedTo: supervisor.id,
                                    permission: permissionUpdated.id,
                                    title: 'Nueva solicitud de permiso en estado <b>' + status.name + '</b>',
                                    type: 'Permission-Status'
                                });
                            });

                            NotificationService.sendNotifications(notificationList);
                        },
                        sendEmail: cb => {

                            async.setImmediate(cb);

                            // Envio notificación por correo a usuario creador del permiso
                            EmailService.sendPermissionNotification([{
                                employee: permissionUpdated.owner,
                                permissionId: permissionUpdated.id,
                                title: 'Actualización de solicitud de permiso',
                                description: '<span><b>' + req.session.employee.fullname + '</b> cambió el estado a <b>' + status.name + '</b> en permiso solicitado.</span>',
                                type: 'default',
                                permission: permissionUpdated,
                                sender: req.session.employee.fullname,
                            }]);
                        }
                    }, err => {
                        if (err) { sails.log(err); }
                    });
                });
            }
        ], (err) => {
            if (err) { return res.serverError(err); }
            res.ok();
        });
    },
    addComment: function (req, res) {
        if (!req.body.comment.idModelModule) {
            return res.negotiate('No ha ingresdo id de permiso');
        }
        req.body.comment.createdBy = req.session.employee.id;

        if (req.body.comment.attachments) {
            _.remove(req.body.comment.attachments, (archive) => {
                if (!archive.id) {
                    return archive;
                }
            });
        }

        Comment.create(req.body.comment).exec((err, comment) => {
            if (err) {
                return res.negotiate('No se ha podido ingresar el comentario');
            } else {
                comment.createdBy = req.session.employee;
                comment.attachments = req.body.comment.attachments;
                Permission.message(comment.idModelModule, {
                    message: 'permission:new-comment',
                    data: comment
                });
                return res.ok({ msg: 'COMMENT.SUCCESS.CREATE', obj: comment });
            }
        });
    },
    getTimeline: (req, res) => {
        if (!req.body.id) {
            return res.negotiate('No ha ingresado id');
        }

        var getComments = cb => {
            Comment
                .find({ idModelModule: req.body.id, modelModule: 'permission' })
                .populate('createdBy')
                .populate('attachments')
                .exec((err, comments) => {
                    cb(null, comments || []);
                });
        };

        var getPermissionStatusLog = cb => {
            PermissionLog
                .find({ permission: req.body.id })
                .populate('createdBy')
                .populate('status')
                .exec((err, log) => {
                    cb(null, log || []);
                });
        };

        Permission.subscribe(req, [req.body.id]);
        async.parallel({
            comments: getComments,
            statusLog: getPermissionStatusLog
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.negotiate('No se ha podido obtener comentarios/logs');
            } else {
                return res.ok(results);
            }
        });
    },
    getPermissionListPdf: (req, res) => {
        const { id, perPage } = req.query;
        const moment = require('moment');
        const formatRut = (require('rut.js')).format;
        if (!id) return res.negotiate('Debe ingresar id de cierre permisos');

        var renderOptions = {
            view: 'print/permission/permissionList',
            config: {
                layout: '../layout', //ruta relativa al view
                title: 'Reporte-permisos',
                perPage: perPage || 14, //cantidad de items por página
                data: [
                ]
            }
        };

        var getPermissions = idPermissionClosure => new Promise((res, rej) => {
            Permission
                .find({
                    closure: idPermissionClosure
                })
                .populate('unit')
                .populate('owner')
                .then(permissionClosure => res(_.map(permissionClosure, (permission) => {
                    permission.fromDate = moment(permission.fromDate).format('DD/MM/YYYY');
                    permission.untilDate = moment(permission.untilDate).format('DD/MM/YYYY');
                    permission.owner.rut = formatRut(permission.owner.rut);
                    return permission;
                })), err => rej(err));
        });

        (async () => {
            try {
                var permissionsClosure = await getPermissions(id);
                renderOptions.config.data = permissionsClosure;
                sails.renderView(renderOptions.view, renderOptions.config, (err, html) => {
                    if (err) { throw err; }
                    (async () => {
                        let pdf = await PdfService.generatePdf(html, { width: '8.5in', height: '13in' });
                        let fileName = encodeURI(renderOptions.config.title + '-' + moment().format('DD/MM/YYYY'));
                        res.set('Content-Disposition', 'attachment; filename*=UTF-8\'\'' + fileName + '.pdf');
                        res.send(pdf);
                    })();
                });
            } catch (e) {
                sails.log(e);
                return res.negotiate('Ha ocurrido un error, vuelva a intentarlo');
            }
        })();
    },
    /**
     * Genera y entrega PDF del detalle de un permiso
     */
    getPermissionDetailPdf: (req, res) => {
        const idPermission = (req.query || {}).id;
        const moment = require('moment');
        const _ = require('lodash');
        const formatRut = (require('rut.js')).format;
        if (!idPermission) return res.negotiate('Falta identificador de permiso');

        var defaultRenderOptions = {
            view: 'print/permission/permissionDetail',
            config: {
                layout: '../layout', //ruta relativa al view
                title: 'Detalle permiso #',
                data: {}
            }
        }

        var calcTotalDuration = (detailsDay) => {
            let day = _.sumBy(_.filter(detailsDay, { quantity: 1, unity: 'day' }), 'quantity');
            let midday = _.sumBy(_.filter(detailsDay, { quantity: 0.5, unity: 'day' }), 'quantity') * 2;
            let hours = _.sumBy(_.filter(detailsDay, { unity: 'hour' }), 'quantity');
            let hour = parseInt(hours);
            let min = (hours - parseInt(hours)) * 60;

            var durationText = day ? day > 1 ? day + ' días, ' : day + ' día, ' : '';
            durationText = durationText + (midday ? midday > 1 ? midday + ' medios días, ' : midday + ' medio día, ' : '');
            durationText = durationText + (hour > 0 ? hour > 1 ? hour + ' hrs ' : hour + ' hr ' : '');
            durationText = durationText + (min > 0 ? min + ' min' : '');
            durationText = durationText.replace(/, $| $/, '');
            return durationText;
        }

        var renderOptions = _.merge(defaultRenderOptions, (req.body || {}).renderOptions || {});

        Permission.findOne(idPermission)
            .populate('owner')
            .populate('unit')
            .populate('type')
            .then((dataPermission, err) => {
                if (err) return negotiate(err);
                if (dataPermission) {
                    renderOptions.config.data = dataPermission;
                    dataPermission.createdDate = moment(dataPermission.createdAt).format('DD/MM/YYYY');
                    dataPermission.fromDate = moment(dataPermission.fromDate).format('DD/MM/YYYY');
                    dataPermission.untilDate = moment(dataPermission.untilDate).format('DD/MM/YYYY');
                    dataPermission.duration = calcTotalDuration(dataPermission.detailsDay);
                    dataPermission.owner.rut = formatRut(dataPermission.owner.rut);
                    sails.renderView(renderOptions.view, renderOptions.config, (err, html) => {
                        if (err) { return res.negotiate(err); }
                        /* const fs = require('fs-extra');
                        fs.writeFile('.tmp/test.html', html); */

                        (async () => {
                            let pdf = await PdfService.generatePdf(html, { width: '8.5in', height: '13in' });
                            let fileName = encodeURI(renderOptions.config.title + dataPermission.id);
                            res.set('Content-Disposition', 'attachment; filename*=UTF-8\'\'' + fileName + '.pdf');
                            res.send(pdf);
                        })();
                    });
                } else {
                    return res.negotiate('No tiene permisos');
                }
            }, err => res.negotiate(err));
    }
};

