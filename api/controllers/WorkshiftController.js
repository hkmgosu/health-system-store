/**
 * WorkshiftController
 *
 * @description :: Server-side logic for managing Workshifts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

module.exports = {
    /**
     * Creación de turno
     */
    create: (req, res) => {
        let workshift = req.body.workshift;
        // Identificar a quien está creando el turno
        workshift.createdBy = req.session.employee.id;

        async.series({
            validate: cb => {
                // Validar hora inicio sea menor a hora de término
                if (new Date(workshift.startTime) > new Date(workshift.endTime)) {
                    return async.setImmediate(() => cb(new Error('Hora de inicio debe ser menor a hora de término')));
                }
                // Validar que no exista un turno entre las horas de inicio/término
                Workshift.findOne({
                    establishment: workshift.establishment,
                    deleted: false,
                    or: [{
                        startTime: {
                            '>': workshift.startTime,
                            '<': workshift.endTime
                        }
                    }, {
                        endTime: {
                            '>': workshift.startTime,
                            '<': workshift.endTime
                        }
                    }, {
                        startTime: {
                            '<=': workshift.startTime
                        },
                        endTime: {
                            '>=': workshift.endTime
                        }
                    }]
                }).then(
                    finded => cb(_.isEmpty(finded) ? null : new Error('Ya existe un turno entre las horas ingresadas')),
                    cb
                );
            },
            execute: cb => {
                // Crear registro del turno
                Workshift.create(_.omit(workshift, 'careTeamList')).then(workshiftCreated => {
                    // Agregar cada equipo de trabajo asociado al turno
                    async.eachSeries(workshift.careTeamList, (careTeam, cb) => {
                        careTeam.workshift = workshiftCreated.id;
                        CareTeam.create(careTeam).then(careTeamCreated => {
                            async.forEach(careTeam.participantList, (participant, cb) => {
                                Object.assign(participant, {
                                    careTeam: careTeamCreated.id,
                                    workshift: workshiftCreated.id
                                });
                                Participant.create(participant).exec(cb);
                            }, cb);
                        }, cb);
                    }, err => cb(err, workshiftCreated));
                }, cb);
            }
        }, (err, results) => {
            if (err) { return res.badRequest(err); }
            res.ok(results.execute);
        });
    },
    /**
     * Obtener lista de turnos con filtros seleccionados
     */
    getList: (req, res) => {
        let { filter, timeMode, paginate } = req.body;
        let now = new Date();
        let moment = require('moment');
        let findFilter = { deleted: false };
        let sort = '';
        switch (timeMode) {
            case 'pasados': {
                Object.assign(findFilter, { endTime: { '<': now } });
                sort = 'startTime DESC';
                break;
            }
            case 'vigentes': {
                Object.assign(findFilter, {
                    startTime: { '<': now },
                    endTime: { '>': now }
                });
                sort = 'startTime DESC';
                break;
            }
            case 'futuros': {
                Object.assign(findFilter, { startTime: { '>': now } });
                sort = 'startTime ASC';
                break;
            }
        }
        if (filter.startTime) {
            _.defaults(findFilter, { startTime: { '>': moment(filter.startTime).startOf('day').toDate() } });
        }
        if (filter.endTime) {
            _.defaults(findFilter, { endTime: { '<': moment(filter.endTime).endOf('day').toDate() } });
        }
        if (filter.establishment) { findFilter.establishment = filter.establishment; }
        Workshift.find(findFilter).sort(sort).populate('establishment').then(
            workshiftList => !_.isEmpty(workshiftList) ? res.ok(workshiftList) : res.notFound(),
            err => res.serverError(err)
        );
    },
    /**
     * Obtener datos básicos de un turno
     */
    getDetails: (req, res) => {
        let { idWorkshift } = req.body;
        if (!idWorkshift) { return res.badRequest(); }
        Workshift.findOne({
            id: idWorkshift,
            deleted: false
        }).populate('establishment').populate('createdBy').then(workshift => {
            res.ok(workshift);
            Workshift.subscribe(req, [idWorkshift]);
        }, err => res.serverError(err))
    },
    /**
     * Obtener lista completa de equipos de trabajo de un turno con sus participantes
     */
    getFullCareTeamList: (req, res) => {
        let { idWorkshift } = req.body;
        if (!idWorkshift) { return res.badRequest(); }
        let filter = { workshift: idWorkshift, deleted: false };
        async.parallel({
            careTeamList: cb => CareTeam.find(filter).populate('vehicle').sort('id ASC').exec(cb),
            participantList: cb => ParticipantService.getList(filter).then(
                participantList => cb(null, participantList),
                err => cb(err)
            )
        }, (err, results) => {
            if (err) { return res.serverError(err); }
            let { careTeamList, participantList } = results;
            let careTeamListTmp = [];
            for (let careTeam of careTeamList) {
                let careTeamTmp = careTeam.toJSON();
                careTeamTmp.participantList = _.filter(participantList, { careTeam: careTeam.id }) || [];
                careTeamListTmp.push(careTeamTmp);
            }
            res.ok(careTeamListTmp);
        });
    },
    /**
     * Agregar equipos de trabajo al turno con los vehículos seleccionados
     */
    addCareTeam: (req, res) => {
        let { idWorkshift, idVehicleList } = req.body;
        let vehicleTeamQuery = idVehicleList.map(id => {
            return {
                workshift: idWorkshift,
                vehicle: id
            };
        });

        CareTeam.find({
            workshift: idWorkshift,
            vehicle: idVehicleList,
            deleted: false
        }).then(careTeamList => {
            careTeamList.forEach(careTeam => {
                _.remove(vehicleTeamQuery, vehicleTeam => vehicleTeam.vehicle === careTeam.vehicle);
            });

            if (_.isEmpty(vehicleTeamQuery)) { return res.badRequest(new Error('Los vehículos ya existen en el turno')); }

            CareTeam.create(vehicleTeamQuery).then(careTeamCreated => {

                // Creación de log asociado al turno
                careTeamCreated.forEach(careTeam => {
                    WorkshiftLog.create({
                        type: 'careTeamAdded',
                        vehicle: careTeam.vehicle,
                        createdBy: req.session.employee.id,
                        workshift: careTeam.workshift
                    }).exec(() => { });
                });

                // Envío de respuesta al cliente
                CareTeam.find(_.map(careTeamCreated, 'id')).populate('vehicle').then(
                    careTeamList => res.ok(careTeamList),
                    err => res.serverError(err)
                );
            }, err => res.serverError(err));
        });
    },
    /**
     * Eliminar un equipo de trabajo del turno
     */
    removeCareTeam: (req, res) => {
        let { idCareTeam } = req.body;
        if (!idCareTeam) { res.badRequest(); }
        CareTeam.update(idCareTeam, { deleted: true }).then(careTeamUpdated => {
            if (_.isEmpty(careTeamUpdated)) {
                res.notFound();
            } else {
                // Creación de log asociado al turno
                WorkshiftLog.create({
                    type: 'careTeamRemoved',
                    vehicle: careTeamUpdated[0].vehicle,
                    createdBy: req.session.employee.id,
                    workshift: careTeamUpdated[0].workshift
                }).exec(() => { });

                // Envío de respuesta al cliente
                res.ok();
            }
        }, err => res.serverError(err));
    },
    getEstablishmentVehicleList: (req, res) => {
        let { idEstablishment } = req.body;
        if (!idEstablishment) { return res.badRequest(); }
        Vehicle.find({ deleted: false, establishment: idEstablishment }).then(
            vehicleList => res.ok(vehicleList),
            err => res.serverError(err)
        );
    },
    /**
     * Agregar comentario a un turno
     */
    addComment: (req, res) => {
        let comment = req.body.comment;
        if (!comment) { return res.badRequest(); }
        // set createdBy value
        comment.createdBy = req.session.employee.id;

        Comment.create(comment).then(commentCreated => {
            commentCreated.createdBy = req.session.employee;
            // Transmitir mensaje
            Workshift.message(comment.idModelModule, {
                message: 'commentCreated',
                data: commentCreated
            });
            return res.ok(commentCreated);
        }, err => res.serverError(err));
    },
    /**
     * Obtener lista de comentarios del turno
     */
    getTimeline: (req, res) => {
        let { idWorkshift } = req.body;
        if (!idWorkshift) { return res.badRequest(); }

        async.parallel({
            comments: cb => {
                Comment.find({ idModelModule: idWorkshift, modelModule: 'workshift', deleted: false })
                    .populate('createdBy')
                    .populate('attachments')
                    .exec(cb);
            },
            log: cb => {
                WorkshiftLog.find({ workshift: idWorkshift, deleted: false })
                    .populate('createdBy')
                    .populate('member')
                    .populate('vehicle')
                    .exec(cb);
            }
        }, (err, results) => {
            if (err) { return res.serverError(err); }
            res.ok([].concat(results.comments, results.log));
        });
    },
    /**
     * Eliminar un turno
     */
    delete: (req, res) => {
        let idWorkshift = req.body.idWorkshift;
        if (!idWorkshift) { return res.badRequest(); }
        Workshift.update(idWorkshift, { deleted: true }).then(
            workshiftUpdated => res.send({ ok: !_.isEmpty(workshiftUpdated) }),
            err => res.send({ ok: false, obj: err })
        );
    },
    /**
     * Validar inicio de turno
     */
    validate: (req, res) => {
        let idWorkshift = req.body.idWorkshift;
        if (!idWorkshift) { return res.badRequest(); }

        let moment = require('moment');

        Workshift.findOne(idWorkshift).then(workshift => {

            if (moment(workshift.startTime) > moment().add(1, 'h').toDate()) {
                return res.badRequest(new Error('El turno se puede activar desde una hora antes de comenzar'));
            }

            Object.assign(workshift, {
                validated: true,
                validatedBy: req.session.employee.id,
                validatedAt: new Date()
            });

            workshift.save(err => {
                if (err) { return res.serverError(err); }
                WorkshiftLog.create({
                    type: 'workshiftActivated',
                    createdBy: req.session.employee.id,
                    workshift: idWorkshift
                }).exec(() => { });

                res.ok();
            });
        }, err => res.serverError(err));
    },
    getCurrentWorkshift: (req, res) => {
        if (req.session.workshift) {
            res.ok(req.session.workshift.id);
        } else {
            res.badRequest();
        }
    },
    getEmployeeHistory: (req, res) => {
        let { idEmployee, endTime } = req.body;
        if (!idEmployee || !endTime) { return res.badRequest(); }
        Participant.find({
            member: idEmployee,
            careTeam: { '!': null },
            deleted: false,
            endTime: { '<=': endTime }
        })
            .paginate({ page: 1, limit: 5 })
            .sort('startTime DESC')
            .then(participantList => {
                async.forEach(participantList, (participant, cb) => {
                    async.parallel({
                        careTeam: cb => CareTeam.findOne(participant.careTeam).populate('vehicle').exec(cb),
                        workshift: cb => Workshift.findOne(participant.workshift).populate('establishment').exec(cb)
                    }, (err, results) => {
                        if (results) { Object.assign(participant, results); }
                        cb();
                    });
                }, err => {
                    res.ok(participantList);
                });
            }, err => res.serverError(err));
    },
    update: (req, res) => {
        let workshift = req.body.workshift;
        if (_.isEmpty(workshift)) { return res.badRequest(); }

        Workshift.update(workshift.id, workshift).then(updated => {
            if (_.isEmpty(updated)) { return res.serverError(); }

            Participant.update({
                workshift: workshift.id,
                deleted: false
            }, _.pick(workshift, ['startTime', 'endTime'])).exec(() => { });

            WorkshiftLog.create({
                type: 'workshiftUpdated',
                createdBy: req.session.employee.id,
                workshift: workshift.id
            }).exec(() => { });

            res.ok();
        }, err => res.serverError(err));
    },
    copy: (req, res) => {

        let { id, title, timeList } = req.body.copyValues;

        async.waterfall([
            // getWorkshift
            cb => {
                Workshift.findOne(id).then(workshift => {
                    CareTeam.find({ workshift: id }).populate('participantList', { deleted: false }).then(careTeamList => {
                        workshift.careTeamList = careTeamList;
                        cb(null, workshift);
                    }, cb);
                }, cb);
            },
            // generateCopy
            (workshiftTemplate, cb) => {
                let workshiftListToCreate = timeList.map(timeItem => {
                    return Object.assign(timeItem, {
                        title: title,
                        establishment: workshiftTemplate.establishment,
                        createdBy: req.session.employee.id
                    });
                });

                Workshift.create(workshiftListToCreate).then(workshiftListCreated => {
                    async.forEach(workshiftListCreated, (workshiftCreated, cb) => {

                        let careTeamMapped = workshiftTemplate.careTeamList.map(careTeam => {
                            return {
                                vehicle: careTeam.vehicle,
                                workshift: workshiftCreated.id
                            };
                        });

                        CareTeam.create(careTeamMapped).then(careTeamListCreated => {

                            var participantListToCreate = [];

                            careTeamListCreated.forEach(careTeamCreated => {

                                let careTeamRef = _.find(workshiftTemplate.careTeamList, { vehicle: careTeamCreated.vehicle });

                                participantListToCreate = participantListToCreate.concat(careTeamRef.participantList.map(participant => {
                                    return {
                                        member: participant.member,
                                        careTeam: careTeamCreated.id,
                                        workshift: workshiftCreated.id,
                                        startTime: workshiftCreated.startTime,
                                        endTime: workshiftCreated.endTime
                                    };
                                }));

                            });

                            if (!_.isEmpty(participantListToCreate)) {
                                Participant.create(participantListToCreate).exec(cb);
                            } else {
                                cb();
                            }


                        }, cb);

                    }, cb);
                }, cb);
            }
        ], err => {
            if (err) { return res.serverError(err); }
            res.ok();
        });
    },
    // Validar que no exista un turno entre las horas de inicio/término
    remoteValidate: (req, res) => {
        let { workshift } = req.body;

        if (!_.has(workshift, 'establishment') || !_.has(workshift, 'startTime') || !_.has(workshift, 'endTime')) {
            return res.badRequest('Faltan parámetros');
        }

        // Validar hora inicio sea menor a hora de término
        if (new Date(workshift.startTime) > new Date(workshift.endTime)) {
            return res.badRequest('Hora de inicio debe ser menor a hora de término');
        }
        // Validar que no exista un turno entre las horas de inicio/término
        Workshift.find(Object.assign({
            establishment: workshift.establishment,
            deleted: false,
            or: [{
                startTime: {
                    '>': workshift.startTime,
                    '<': workshift.endTime
                }
            }, {
                endTime: {
                    '>': workshift.startTime,
                    '<': workshift.endTime
                }
            }, {
                startTime: {
                    '<=': workshift.startTime
                },
                endTime: {
                    '>=': workshift.endTime
                }
            }]
        }, workshift.id ? { id: { '!': workshift.id } } : {})).populate('establishment').then(
            workshiftFinded => _.isEmpty(workshiftFinded) ? res.badRequest() : res.ok(workshiftFinded),
            err => res.serverError(err)
        );
    },
    updateJob: (req, res) => {
        let { idParticipant, idJob, replace } = req.body;
        if (!idParticipant || !idJob) { return res.badRequest(); }
        Participant.update(idParticipant, { job: idJob }).then(participantUpdated => {
            if (_.isEmpty(participantUpdated)) { return res.badRequest(); }
            if (replace) { Employee.update(participantUpdated.pop().member, { job: idJob }).exec(() => { }); }
            res.ok();
        }, err => res.serverError(err));
    }
};

