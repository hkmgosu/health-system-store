/**
 * ViaticController
 *
 * @description :: Server-side logic for managing viatics
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    create: (req, res) => {

        let viatic = req.body.viatic;
        var mails = [];

        async.parallel({
            getStatus: cb => WorkflowStatus.findOne({ module: 'viatic', order: 1 }).exec(cb),
            getUnit: cb => WorkflowService.getReportedUnit(req.session.employee).then(unit => cb(null, unit), cb)
        }, (err, results) => {
            if (err) { return res.badRequest(err); }

            while (!_.isEmpty(viatic.daysDetails) && !_.first(viatic.daysDetails).value.quantity) {
                viatic.daysDetails.shift();
            }
            while (!_.isEmpty(viatic.daysDetails) && !_.last(viatic.daysDetails).value.quantity) {
                viatic.daysDetails.pop();
            }

            viatic.fromDate = _.first(viatic.daysDetails).date;
            viatic.toDate = _.last(viatic.daysDetails).date;

            if (_.isEmpty(viatic.daysDetails)) { return res.badRequest('No hay días seleccionadoss'); }

            Object.assign(viatic, {
                owner: req.session.employee.id,
                status: results.getStatus,
                statusLog: '.' + results.getStatus.id + '.',
                legalQuality: req.session.employee.legalquality,
                unit: results.getUnit.id,
                establishment: results.getUnit.establishment,
                level: req.session.employee.level
            });
            Viatic.create(viatic).then(viaticCreated => {
                results.getUnit.members.forEach(member => {
                    if (!member || member.id === req.session.employee.id) { return; }
                    NotificationService.sendNotifications({
                        assignedTo: member.id,
                        modelModule: 'viatic',
                        idModelModule: viaticCreated.id,
                        title: '<b>' + req.session.employee.fullname + '</b> ingresó una nueva solicitud de viático',
                        type: 'Viatic'
                    });
                    mails.push({
                        employee: member,
                        viaticId: viaticCreated.id,
                        title: 'Nueva solicitud de viático',
                        description: '<span><b>' + req.session.employee.fullname + '</b> envió una solicitud de viático.</span>',
                        type: 'default',
                        viatic: viaticCreated,
                        sender: req.session.employee.fullname,
                    });
                });
                EmailService.sendViaticNotification(mails);
                res.ok(viaticCreated);
            }, err => res.serverError(err));
        });
    },
    getDetails: (req, res) => {
        let idViatic = req.body.id;
        if (!idViatic) { return res.serverError(); }
        Viatic.findOne(idViatic)
            .populate('status')
            .populate('region')
            .populate('commune')
            .populate('type')
            .populate('legalQuality')
            .populate('unit')
            .populate('establishment')
            .then(viatic => {
                Employee.findOne(viatic.owner).populate('unit').then(employee => {
                    viatic.owner = employee;
                    res.ok(viatic);
                }, err => res.serverError(err));
                Viatic.subscribe(req, [idViatic]);
            }, err => res.serverError(err));
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

        // Filtro num correlativo o motivo permiso
        if (filter.searchText) {
            var correlative = parseInt(filter.searchText);
            if (Number.isInteger(correlative)) {
                dynamicQuery.correlativeNumber = correlative;
            } else {
                dynamicQuery.reason = { 'contains': filter.searchText || '' };
            }
        }

        var getViaticStatus = cb => {
            let filterStatus = { deleted: false, module: 'viatic' };
            if (filter.type) { filterStatus.type = filter.type; }
            if (filter.status) { filterStatus.id = filter.status; }
            WorkflowStatus
                .find(filterStatus)
                .then(status => cb(null, _.map(status, 'id')), cb)
        };

        async.parallel({
            status: getViaticStatus
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
                    Viatic
                        .count(dynamicQuery)
                        .exec(cb);
                },
                data: (cb) => {
                    Viatic
                        .find(dynamicQuery)
                        .sort('id DESC')
                        .paginate({ page: page || 1, limit: 15 })
                        .populate('owner')
                        .populate('type')
                        .populate('region')
                        .populate('commune')
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
                    return res.ok({ viatics: results.data, count: results.count });
                }
            });
        });
    },
    /**
     * Obtener lista de viáticos para cierre
     */
    getList: (req, res) => {
        var filter = req.body.filter || {};

        var dynamicQuery = {
            deleted: false
        };

        Object.assign(dynamicQuery, filter);

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

        // Filtro num correlativo o motivo permiso
        if (filter.searchText) {
            var correlative = parseInt(filter.searchText);
            if (Number.isInteger(correlative)) {
                dynamicQuery.correlativeNumber = correlative;
            } else {
                dynamicQuery.reason = { 'contains': filter.searchText || '' };
            }
        }

        var getViaticStatus = cb => {
            let filterStatus = { deleted: false, module: 'viatic' };
            if (filter.type) filterStatus.type = filter.type;
            WorkflowStatus
                .find(filterStatus)
                .then(status => cb(null, _.map(status, 'id')), cb)
        };

        async.parallel({
            status: getViaticStatus
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.negotiate({ ok: false, obj: err });
            }

            // Filtro de estado
            if (!_.isEmpty(filter.status)) {
                dynamicQuery.status = _.intersection(results.status, filter.status);
            } else {
                dynamicQuery.status = results.status;
            }

            async.parallel({
                count: (cb) => {
                    Viatic
                        .count(dynamicQuery)
                        .exec(cb);
                },
                data: (cb) => {
                    Viatic
                        .find(dynamicQuery)
                        .sort('id DESC')
                        .populate('owner')
                        .populate('type')
                        .populate('region')
                        .populate('commune')
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
                    return res.ok({ viatics: results.data, count: results.count });
                }
            });
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

        // Filtro num correlativo o motivo permiso
        if (filter.searchText) {
            var correlative = parseInt(filter.searchText);
            if (Number.isInteger(correlative)) {
                dynamicQuery.correlativeNumber = correlative;
            } else {
                dynamicQuery.reason = { 'contains': filter.searchText || '' };
            }
        }

        var getViaticStatus = cb => {
            let filterStatus = { deleted: false, module: 'viatic' };
            if (filter.type) { filterStatus.type = filter.type; }
            if (filter.status) { filterStatus.id = filter.status; }
            WorkflowStatus
                .find(filterStatus)
                .then(status => cb(null, _.map(status, 'id')), cb)
        };

        var getSupervisedViatics = cb => {
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
                    } else {
                        cb('No existe supervisor')
                    }
                }, cb)
        };

        async.parallel({
            status: getViaticStatus,
            supervised: getSupervisedViatics
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
                    Viatic
                        .count(dynamicQuery)
                        .exec(cb);
                },
                data: (cb) => {
                    Viatic
                        .find({
                            where: dynamicQuery,
                            sort: {
                                updatedAt: 0,
                                id: 1
                            }
                        })
                        .paginate({ page: page || 1, limit: 15 })
                        .populate('owner')
                        .populate('status')
                        .populate('type')
                        .populate('region')
                        .populate('commune')
                        .populate('unit')
                        .then(data => cb(null, data))
                        .catch(err => cb(err, null));
                }
            }, (err, results) => {
                if (err) {
                    sails.log(err);
                    return res.negotiate({ ok: false, obj: err });
                } else {
                    return res.ok({ viatics: results.data, count: results.count });
                }
            });
        });
    },
    /**
     * Importar valores viático desde excel
     */
    initValues: (req, res) => {
        let xlsx = require('xlsx');
        var workbook = xlsx.readFile('imports/VALORES_VIATICOS.xls');

        var viaticValueList = xlsx.utils.sheet_to_json(workbook.Sheets['hoja1']);

        ViaticValue.destroy().then(() => {
            ViaticValue.create(viaticValueList).then(() => {
                res.ok('Created');
            });
        });
    },
    /**
     * Enviar valores viático según grado de funcionario y año
     */
    getValues: (req, res) => {
        let level = req.session.employee.level;
        if (!level) { return res.badRequest(); }
        ViaticValue.findOne({ year: 2019, level: level }).then(viaticValue => {
            res.ok(viaticValue);
        }, err => res.serverError(err));
    },
    /**
     * Obtener historial y comentarios
     */
    getTimeline: (req, res) => {
        let idViatic = req.body.id;
        if (!idViatic) { return res.badRequest(); }
        async.parallel({
            comments: cb => Comment.find({ deleted: false, idModelModule: parseInt(idViatic), modelModule: 'viatic' }).populate('createdBy').populate('attachments').exec(cb),
            log: cb => ViaticLog.find({ viatic: parseInt(idViatic) }).populate('createdBy').populate('status').exec(cb)
        }, (err, results) => {
            if (err) { return res.serverError(err); }
            res.ok([].concat(results.comments, results.log));
        });
    },
    /**
     * Agregar un nuevo comentario
     */
    addComment: (req, res) => {
        let comment = req.body.comment;
        if (!comment) { return res.badRequest(); }
        // set createdBy value
        comment.createdBy = req.session.employee.id;

        if (comment.attachments) {
            _.remove(comment.attachments, (archive) => {
                if (!archive.id) {
                    return archive;
                }
            });
        }

        Comment.create(comment).then(commentCreated => {
            Viatic.message(commentCreated.idModelModule, {
                message: 'viaticComment',
                data: Object.assign(commentCreated, {
                    createdBy: _.pick(req.session.employee, ['id', 'fullname', 'hasProfilePicture']),
                    attachments: comment.attachments
                })
            });
            res.ok(commentCreated);
        }, err => res.serverError(err));
    },
    /**
     * Actualizar el estado del viático
     */
    changeStatus: (req, res) => {
        let { idStatus, id, comment } = req.body;
        let idEmployee = req.session.employee.id;

        async.waterfall([
            // Validate
            cb => {
                WorkflowService.getEnabledStatusList(id, 'viatic', idEmployee).then(
                    statusList => cb(_.map(statusList, 'id').includes(idStatus) ? null : new Error('Status not enabled')),
                    cb
                );
            },
            // Update
            cb => {
                Viatic.findOne(id).populate('owner').then(viatic => {
                    if (_.isEmpty(viatic)) { return res.badRequest(); }

                    Object.assign(viatic, {
                        status: idStatus,
                        statusLog: viatic.statusLog + idStatus + '.'
                    });

                    viatic.save(err => cb(err, viatic));
                }, cb);
            },
            // After Update
            (viaticUpdated, cb) => {

                async.setImmediate(cb);

                WorkflowStatus.findOne(idStatus).populate('supervisors').then(status => {
                    async.parallel({
                        createLog: cb => {
                            ViaticLog.create({
                                createdBy: req.session.employee.id,
                                viatic: viaticUpdated.id,
                                type: 'statusChanged',
                                status: idStatus,
                                comment: comment
                            }).exec(cb);
                        },
                        sendNotifications: cb => {

                            async.setImmediate(cb);

                            // Enviar notificación al creador del viático
                            let notificationList = [{
                                assignedTo: viaticUpdated.owner.id,
                                modelModule: 'viatic',
                                idModelModule: viaticUpdated.id,
                                title: 'Tu solicitud de <b>viático</b> cambió de estado a <b>' + status.name + '</b>',
                                type: 'Viatic'
                            }];

                            // Enviar notificación a los supervisores del nuevo estado
                            status.supervisors.forEach(supervisor => {
                                notificationList.push({
                                    assignedTo: supervisor.id,
                                    modelModule: 'viatic',
                                    idModelModule: viaticUpdated.id,
                                    title: 'Nueva solicitud de viático en estado <b>' + status.name + '</b>',
                                    type: 'Viatic'
                                });
                            });

                            NotificationService.sendNotifications(notificationList).then(() => { });


                        },
                        sendEmail: cb => {

                            async.setImmediate(cb);

                            // Envio notificación por correo a usuario creador del viatico
                            EmailService.sendViaticNotification([{
                                employee: viaticUpdated.owner,
                                viaticId: viaticUpdated.id,
                                title: 'Actualización de solicitud de viático',
                                description: '<span><b>' + req.session.employee.fullname + '</b> cambió el estado a <b>' + status.name + '</b> en viático solicitado.</span>',
                                type: 'default',
                                viatic: viaticUpdated,
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
    /**
     * Función para generar listado de pdf WIP 
     */
    getViaticListPdf: (req, res) => {
        const { id, perPage } = req.query;
        const moment = require('moment');
        const formatRut = (require('rut.js')).format;
        if (!id) return res.negotiate('Debe ingresar id de cierre viáticos');

        var renderOptions = {
            view: 'print/viatic/viaticList',
            config: {
                layout: '../layout', //ruta relativa al view
                title: 'Reporte-viaticos',
                perPage: perPage || 14, //cantidad de items por página
                data: [
                    /* {
                        resolutionNumber: 1,
                        owner: {
                            fullname: 'Nicolás Albornoz', rut: '17.256.154-3', legalquality: 'Honorarios', unit: 'Desarrollo'
                        },
                        totalAmount: 10000,
                        fromDate: 'MM/DD/YYYY',
                        toDate: 'MM/DD/YYYY'
                    } */
                ]
            }
        };

        var getViatics = idViaticClosure => new Promise((res, rej) => {
            Viatic
                .find({
                    or: [
                        { closureTesoreria: idViaticClosure },
                        { closureContabilidad: idViaticClosure },
                        { closurePartes: idViaticClosure }
                    ]
                })
                .populate('unit')
                .populate('owner')
                .populate('legalQuality')
                .sort('id ASC')
                .then(viaticClosures => res(_.map(viaticClosures, (viatic) => {
                    viatic.fromDate = moment(viatic.fromDate).format('DD/MM/YYYY');
                    viatic.toDate = moment(viatic.toDate).format('DD/MM/YYYY');
                    viatic.owner.rut = formatRut(viatic.owner.rut);
                    viatic.dateResExenta = moment(viatic.dateResExenta).format('DD-MM-YYYY');
                    return viatic;
                })), err => rej(err));
        });

        (async () => {
            try {
                var viaticsClosure = await getViatics(id);
                renderOptions.config.data = viaticsClosure;
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
     * Genera y entrega PDF del detalle de un viatico
     */
    getViaticDetailPdf: (req, res) => {
        if (!(req.query || {}).id) return res.negotiate('Falta identificador de viático');

        const moment = require('moment');
        const formatRut = (require('rut.js')).format;

        var defaultRenderOptions = {
            view: 'print/viatic/viaticDetailList',
            config: {
                layout: '../layout', //ruta relativa al view
                title: 'Detalle viatico #',
                data: []
            }
        };

        var renderOptions = _.merge(defaultRenderOptions, (req.body || {}).renderOptions || {});

        Viatic.findOne(req.query.id)
            .populate('owner')
            .populate('unit')
            .populate('commune')
            .populate('region')
            .then((dataViatic, err) => {
                if (err) return negotiate(err);
                if (dataViatic) {
                    renderOptions.config.data.push(dataViatic);
                    dataViatic.createdDate = moment(dataViatic.createdAt).format('DD/MM/YYYY');
                    dataViatic.fromDate = moment(dataViatic.fromDate).format('DD/MM/YYYY');
                    dataViatic.toDate = moment(dataViatic.toDate).format('DD/MM/YYYY');
                    dataViatic.dateResExenta = dataViatic.dateResExenta ? moment(dataViatic.dateResExenta).format('DD-MM-YYYY') : null;
                    dataViatic.owner.rut = formatRut(dataViatic.owner.rut);
                    sails.renderView(renderOptions.view, renderOptions.config, (err, html) => {
                        if (err) { return res.negotiate(err); }
                        (async () => {
                            let pdf = await PdfService.generatePdf(html, { width: '8.5in', height: '13in' });
                            let fileName = encodeURI(renderOptions.config.title + dataViatic.id);
                            res.set('Content-Disposition', 'attachment; filename*=UTF-8\'\'' + fileName + '.pdf');
                            res.send(pdf);
                        })();
                    });
                } else {
                    return res.negotiate('No tiene permisos');
                }
            }, err => res.negotiate(err));
    },
    /**
     * Genera y entrega PDF del detalle de viaticos de un cierre
     */
    getViaticsDetailPdfByClosure: (req, res) => {
        if (!(req.query || {}).id) return res.negotiate('Falta identificador de cierre de viáticos');

        const moment = require('moment');
        const formatRut = (require('rut.js')).format;

        var defaultRenderOptions = {
            view: 'print/viatic/viaticDetailList',
            config: {
                layout: '../layout', //ruta relativa al view
                title: 'Detalle por viático',
                data: []
            }
        };

        var renderOptions = _.merge(defaultRenderOptions, (req.body || {}).renderOptions || {});

        ViaticClosure.findOne(req.query.id)
            .populate('viaticList')
            .then((closure, err) => {
                if (err) return negotiate(err);
                if ((closure.viaticList || []).length === 0) return res.negotiate('No existen viáticos');
                const idsViatic = _.map(closure.viaticList, 'id');
                Viatic.find(idsViatic)
                    .populate('owner')
                    .populate('unit')
                    .populate('commune')
                    .populate('region')
                    .then((dataViatic, err) => {
                        if (err) return negotiate(err);
                        if (dataViatic) {
                            _.map(dataViatic, viatic => {
                                viatic.createdDate = moment(viatic.createdAt).format('DD/MM/YYYY');
                                viatic.fromDate = moment(viatic.fromDate).format('DD/MM/YYYY');
                                viatic.toDate = moment(viatic.toDate).format('DD/MM/YYYY');
                                viatic.dateResExenta = viatic.dateResExenta ? moment(viatic.dateResExenta).format('DD-MM-YYYY') : null;
                                viatic.owner.rut = formatRut(viatic.owner.rut);
                                renderOptions.config.data.push(viatic);
                            });

                            // Ordena listado por id de viático
                            renderOptions.config.data = _.sortBy(renderOptions.config.data, 'id');

                            sails.renderView(renderOptions.view, renderOptions.config, (err, html) => {
                                if (err) { return res.negotiate(err); }
                                (async () => {
                                    let pdf = await PdfService.generatePdf(html, { width: '8.5in', height: '13in' });
                                    let fileName = encodeURI(renderOptions.config.title);
                                    res.set('Content-Disposition', 'attachment; filename*=UTF-8\'\'' + fileName + '.pdf');
                                    res.send(pdf);
                                })();
                            });
                        } else {
                            return res.negotiate('No tiene permisos');
                        }
                    }, err => res.negotiate(err));
            }, err => res.negotiate(err));
    },
    validateDates: (req, res) => {
        let moment = require('moment');
        let { fromDate, toDate } = req.body;
        fromDate = moment(fromDate).startOf('day').toDate();
        toDate = moment(toDate).endOf('day').toDate();
        Viatic.find({
            owner: req.session.employee.id,
            or: [{
                fromDate: {
                    '>=': fromDate,
                    '<=': toDate
                }
            }, {
                toDate: {
                    '>=': fromDate,
                    '<=': toDate
                }
            }, {
                fromDate: {
                    '<=': fromDate
                },
                toDate: {
                    '>=': toDate
                }
            }],
            status: { '!': [13, 14] }
        }).then(viaticList => {
            let days = viaticList.reduce((total, viatic) => {
                let daysDetails = viatic.daysDetails.filter(day => day.value.quantity);
                return total.concat(daysDetails.map(day => {
                    return {
                        viatic: viatic.id,
                        date: moment(day.date).format('DD-MM-YYYY')
                    };
                }));
            }, []);
            res.ok(days);
        }, err => res.serverError(err));
    },
    getTypeList: (req, res) => {
        ViaticType.find({ deleted: false }).then(
            typeList => res.ok(typeList),
            err => res.negotiate(err)
        );
    },
    initType: (req, res) => {
        ViaticType.destroy({}).then(() => {
            ViaticType.create([
                { id: 1, name: 'Cometido funcional' },
                { id: 2, name: 'Comisión de servicio' }
            ]).then(typeList => res.ok(typeList));
        });
    },
    getStatusList: (req, res) => {
        WorkflowStatus.find({ module: 'viatic' }).then(viaticList => res.ok(viaticList), err => res.serverError(err));
    }
};

