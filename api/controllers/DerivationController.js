/**
 * DerivationController
 *
 * @description :: Server-side logic for managing derivations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

module.exports = {
    get: (req, res) => {
        let id = req.body.id;
        if (!id) { return res.send({ ok: false }); }
        Derivation.findOne({ deleted: false, id: id })
            .populate('fromEstablishment')
            .populate('toEstablishment')
            .populate('attachments')
            .populate('fromUnit')
            .populate('toUnit')
            .populate('createdBy')
            .populate('status')
            .populate('requiredEquipment')
            .then(
                derivation => {
                    Derivation.subscribe(req, [id]);

                    Patient.findOne(derivation.patient).populate('address').then(patient => {
                        derivation.patient = patient;
                        res.send({ ok: true, obj: derivation });
                    }, err => res.send({ ok: false, obj: err }));
                },
                err => res.send({ ok: false, obj: err })
            );
    },
    getList: (req, res) => {
        let { finished, filter } = req.body;
        let { page, limit } = req.body.pagination;

        async.parallel({
            statusList: cb => DerivationStatus.find({ deleted: false, finished: finished }).exec(cb),
            establishmentList: cb => {
                Employee.findOne(req.session.employee.id)
                    .populate('bedManagementEstablishmentSupervised').then(employee => {
                        cb(null, employee.bedManagementEstablishmentSupervised || []);
                    }, cb);
            }
        }, (err, results) => {
            if (err) { return res.send({ ok: false }); }
            if (_.isEmpty(results.establishmentList)) { return res.send({ ok: false }); }
            let criteria = {
                deleted: false,
                status: _.map(results.statusList, 'id'),
                fromEstablishment: (!_.isEmpty(filter.fromEstablishment)) ?
                    _.intersection(_.map(results.establishmentList, 'id'), filter.fromEstablishment) : _.map(results.establishmentList, 'id'),
                toEstablishment: (!_.isEmpty(filter.toEstablishment)) ?
                    _.intersection(_.map(results.establishmentList, 'id'), filter.toEstablishment) : _.map(results.establishmentList, 'id')
            };

            async.parallel({
                count: (cb) => Derivation.count(criteria).exec(cb),
                list: (cb) => {
                    Derivation.find({
                        where: criteria,
                        skip: (page - 1) * limit,
                        limit: limit || 10,
                    })
                        .populate('fromEstablishment')
                        .populate('toEstablishment')
                        .populate('attachments')
                        .populate('fromUnit')
                        .populate('toUnit')
                        .populate('patient')
                        .populate('createdBy')
                        .populate('status')
                        .populate('requiredEquipment')
                        .sort('id DESC')
                        .exec(cb);
                }
            }, (err, results) => res.send({ ok: true, obj: results }));
        });
    },
    create: (req, res) => {
        let derivation = req.body.derivation;
        derivation.createdBy = req.session.employee.id;
        derivation.status = 1;
        Derivation.create(derivation).then(
            derivationCreated => {
                // Add stakeholders
                Establishment.findOne(derivationCreated.toEstablishment)
                    .populate('bedManagementSupervisors').then(establishment => {
                        let stakeholderList = [];
                        establishment.bedManagementSupervisors.forEach(supervisor => {
                            stakeholderList.push({
                                employee: supervisor.id,
                                derivation: derivationCreated.id,
                                role: 'owner'
                            });
                        });
                        stakeholderList.push({
                            employee: req.session.employee.id,
                            derivation: derivationCreated.id,
                            role: 'owner'
                        });
                        DerivationStakeholder.create(stakeholderList).then(() => {
                            // Return to client
                            res.send({ ok: true, obj: derivationCreated });
                        });
                    });
            },
            err => res.send({ ok: false, obj: err })
        );
    },
    setUnitDerivationModuleAvailable: (req, res) => {
        let idUnit = req.body.idUnit;
        let derivationModuleAvailable = req.body.derivationModuleAvailable;
        if (!idUnit) { return res.send({ ok: false }); }
        Unit.update({ id: idUnit }, {
            derivationModuleAvailable: !!(derivationModuleAvailable)
        }).then(
            updatedList => {
                res.send({ ok: !(_.isEmpty(updatedList)) });
            },
            err => res.send({ ok: false, obj: err })
        );
    },
    getUnitListAvailable: (req, res) => {
        let idEstablishment = req.body.idEstablishment;
        if (!idEstablishment) { return res.send({ ok: false }); }
        Unit.find({ establishment: idEstablishment, derivationModuleAvailable: true })
            .then(
                unitList => res.send({ ok: true, obj: unitList }),
                err => res.send({ ok: false, obj: err })
            );
    },
    /**
     * TODO quitar en producción
     * Eliminar todas las derivaciones
     */
    clean: (req, res) => {
        Derivation.destroy({}).then(() => res.send({ ok: true }));
    },
    addComment: (req, res) => {
        let derivationComment = req.body.comment;
        DerivationLog.create({
            createdBy: req.session.employee.id,
            comment: derivationComment.description,
            derivation: derivationComment.derivation,
            type: 'comment'
        }).then(
            derivationCommentCreated => {
                res.send({ ok: true, obj: derivationCommentCreated });
            },
            err => res.send({ ok: false, obj: err })
        );
    },
    getTimeline: (req, res) => {

        let idDerivation = req.body.idDerivation;

        if (!idDerivation) { return res.send({ ok: false }); }

        DerivationLog.find({ derivation: idDerivation, deleted: false })
            .populate('createdBy')
            .then(
                log => res.send({ ok: true, obj: log }),
                err => res.send({ ok: false, obj: err })
            );
    },
    initEquipment: (req, res) => {
        Equipment.destroy({}).then(() => {
            Equipment.create([{
                id: 1,
                name: 'O2'
            }, {
                id: 2,
                name: 'Camilla'
            }]).then(equipmentList => res.send({ ok: true, obj: equipmentList }));
        });
    },
    getRequiredEquipmentList: (req, res) => {
        Equipment.find({ deleted: false }).then(equipmentList => res.send({ ok: true, obj: equipmentList }));
    },
    update: (req, res) => {
        let { derivation, log } = req.body;
        if (!derivation || !derivation.id) { return res.send({ ok: false }); }
        Derivation.update(derivation.id, derivation).then(derivationUpdated => {
            if (_.isEmpty(derivationUpdated)) { return res.send({ ok: false }); }
            if (log) {
                DerivationLog.create({
                    derivation: derivation.id,
                    createdBy: req.session.employee.id,
                    comment: log.comment,
                    type: log.type,
                    obj: log.obj
                }).then(() => { });
            }
            res.send({ ok: true });
        });
    },
    unsubscribe: (req, res) => Derivation.unsubscribe(req, req.body.id),
    getMySupervisedEstablishmentList: (req, res) => {
        Employee.findOne(req.session.employee.id)
            .populate('bedManagementEstablishmentSupervised').then(employee => {
                res.send({ ok: true, obj: employee.bedManagementEstablishmentSupervised || [] });
            }, err => res.send({ ok: false }));
    }
};

