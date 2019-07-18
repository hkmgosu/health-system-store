/**
 * ViaticController
 *
 * @description :: Server-side logic for managing viatics
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    create: (req, res) => {
        let { viaticClosure } = req.body;
        viaticClosure.createdBy = req.session.employee.id;
        ViaticClosure.create(viaticClosure).then(closureCreated => {

            async.forEach(viaticClosure.viaticList, (viatic, cb) => {
                if (viaticClosure.type === 'partes') {
                    Viatic.update(viatic, { closurePartes: closureCreated.id }).exec(cb);
                } else if (viaticClosure.type === 'contabilidad') {
                    Viatic.update(viatic, { closureContabilidad: closureCreated.id }).exec(cb);
                } else if (viaticClosure.type === 'tesoreria') {
                    Viatic.update(viatic, { closureTesoreria: closureCreated.id }).exec(cb);
                }
            }, err => {
                res.ok(closureCreated);
            });

        }, err => res.serverError(err));
    },
    getList: (req, res) => {
        ViaticClosure.find(req.body).populate('createdBy').sort('id DESC').then(
            closureList => res.ok(closureList),
            err => res.serverError(err)
        );
    },
    getDetails: (req, res) => {
        let { idViaticClosure } = req.body;

        ViaticClosure.findOne(idViaticClosure)
            .populate('createdBy')
            .then(viaticClosure => {
                if (_.isEmpty(viaticClosure)) { return res.notFound(); }
                Viatic.find({
                    or: [
                        { closureContabilidad: idViaticClosure },
                        { closurePartes: idViaticClosure },
                        { closureTesoreria: idViaticClosure }
                    ]
                })
                    .populate('owner')
                    .populate('type')
                    .populate('region')
                    .populate('commune')
                    .populate('status')
                    .populate('unit')
                    .populate('legalQuality')
                    .sort('id ASC')
                    .then(viaticList => {
                        res.ok(Object.assign(viaticClosure.toJSON(), { viaticList: viaticList }));
                    }, err => res.serverError(err));
            }, err => res.serverError(err));
    },
    confirm: (req, res) => {
        let { viaticClosure } = req.body;

        async.parallel({
            viaticClosure: cb => ViaticClosure.update(viaticClosure.id, { confirmed: true }).exec(cb),
            viaticList: cb => {
                async.parallel({
                    viaticList: cb => ViaticClosure.findOne(viaticClosure.id)
                        .populate('viaticList')
                        .then(viaticClosure => cb(null, viaticClosure.viaticList), cb),
                    statusList: cb => WorkflowStatus.find({ module: 'viatic' }).exec(cb)
                }, (err, results) => {
                    if (err) { return res.serverError(err); }
                    let { statusList, viaticList } = results;
                    async.forEach(viaticList, (viatic, cb) => {
                        // Obtener detalle de estado actual
                        let currentStatus = _.find(statusList, { id: viatic.status });
                        if (currentStatus.type !== 'closed') {
                            // Obtener siguiente estado según order
                            let nextStatus = _.first(statusList.filter(status => status.order > currentStatus.order).sort((a, b) => a.order > b.order));
                            // Crear log de cambio estado
                            ViaticLog.create({
                                createdBy: req.session.employee.id,
                                viatic: viatic.id,
                                type: 'statusChanged',
                                status: nextStatus.id
                            }).then(() => { }, err => sails.log(err));
                            // Envio notificación por correo a usuario creador del viatico
                            Employee.findOne(viatic.owner).then(owner => {
                                EmailService.sendViaticNotification([{
                                    employee: owner,
                                    viaticId: viatic.id,
                                    title: 'Actualización de solicitud de viático',
                                    description: '<span><b>' + req.session.employee.fullname + '</b> cambió el estado a <b>' + nextStatus.name + '</b> en viático solicitado.</span>',
                                    type: 'default',
                                    viatic: viatic,
                                    sender: req.session.employee.fullname,
                                }]);
                            }, err => sails.log(err));
                            // Enviar notificación al creador del viático
                            NotificationService.sendNotifications({
                                assignedTo: viatic.owner,
                                modelModule: 'viatic',
                                idModelModule: viatic.id,
                                title: 'Tu solicitud de <b>viático</b> cambió de estado a <b>' + nextStatus.name + '</b>',
                                type: 'Viatic'
                            });
                            // Actualizar datos viático
                            Viatic.update(viatic.id, Object.assign(_.find(viaticClosure.viaticList, { id: viatic.id }), {
                                status: nextStatus.id,
                                statusLog: viatic.statusLog + nextStatus.id + '.'
                            })).exec(cb);
                        } else {
                            Viatic.update(viatic.id, _.find(viaticClosure.viaticList, { id: viatic.id })).exec(cb);
                        }
                    }, cb);
                });
            },
            supervisorsNotification: cb => {
                // Enviar notificación a los supervisores del nuevo estado
                /* WorkflowStatus.findOne((viaticClosure.type === 'partes') ? 10 : 11).populate('supervisors').then(status => {
                    if (_.isEmpty(status) || _.isEmpty(status.supervisor)) { return; }
                    status.supervisors.forEach(supervisor => {
                        Notification.create({
                            assignedTo: supervisor.id,
                            title: 'Nuevos viáticos en estado ' + status.name,
                            type: 'Viatic'
                        }).then(() => { });
                    });
                }); */

                async.setImmediate(cb);
            }
        }, (err, results) => {
            if (err) { return res.serverError(err); }
            res.ok();
        });
    }
};