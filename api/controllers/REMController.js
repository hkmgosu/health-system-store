/**
 * RemController
 *
 * @description :: Server-side logic for managing rems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    save: function (req, res) {
        var rem = req.body.rem;
        var options = req.body.options || {};

        if (rem && rem.id) {
            Rem.findOne({ id: rem.id, deleted: false }).then(findedRem => {
                if (!findedRem) { return res.send({ ok: false }); }
                if (findedRem.originAddress && _.isObject(rem.originAddress) && !_.isEmpty(rem.originAddress)) {
                    rem.originAddress.id = findedRem.originAddress;
                }
                Rem.update(rem.id, rem).exec(function (err, rems) {
                    if (err || _.isEmpty(rems)) {
                        return res.send({ ok: false, msg: 'REM.ERROR.UPDATE', obj: err });
                    } else {
                        let rem = rems.pop();
                        if (options.log) {
                            RemLog.create({
                                rem: rem.id,
                                createdBy: req.session.employee.id,
                                type: options.log,
                                comment: options.comment,
                                reason: options.reason,
                                status: (options.log === 'statusChanged') ? rem.status : null
                            }).exec(() => { });
                        }
                        if (!_.isEmpty(options.employeeNotifyList)) {
                            let notificationList = options.employeeNotifyList.map(idEmployee => {
                                return {
                                    title: '<span><b>' + req.session.employee.fullname + '</b> te mencionó en un incidente SAMU</span>',
                                    idModelModule: rem.id,
                                    modelModule: 'rem',
                                    type: 'Rem',
                                    assignedTo: idEmployee
                                };
                            });
                            NotificationService.sendNotifications(notificationList);
                        }

                        // Enviar notificaciones a usuarios con cargo supervisor del nuevo estado
                        if (options.log === 'statusChanged') {
                            async.parallel({
                                status: cb => RemStatus.findOne(rem.status).populate('supervisorList').exec(cb),
                                participantList: cb => {
                                    let now = new Date();

                                    async.waterfall([
                                        cb => Workshift.find({ startTime: { '<': now }, endTime: { '>': now }, deleted: false }).exec(cb),
                                        (workshiftList, cb) => CareTeam.find({ workshift: _.map(workshiftList, 'id'), deleted: false }).exec(cb),
                                        (careTeamList, cb) => Participant.find({ careTeam: _.map(careTeamList, 'id') }).populate('member').exec(cb)
                                    ], cb);
                                }
                            }, (err, results) => {
                                if (err) { return; }
                                let { status, participantList } = results;

                                // Si el estado del incidente no tiene cargos que supervisen no se envían notificaciones
                                if (_.isEmpty(status.supervisorList)) { return; }
                                let idsJobList = _.map(status.supervisorList, 'id');

                                participantList = participantList.filter(participant => {
                                    return idsJobList.includes(participant.member.job);
                                });

                                // Si la lista de personas en un turno con los cargos seleccionados está vacía no se envían notificaciones
                                if (_.isEmpty(participantList)) { return; }

                                let notificationList = participantList.map(participant => {
                                    return {
                                        title: '<span><b>' + req.session.employee.fullname + '</b> envió un incidente a estado <b>' + status.description + '</b></span>',
                                        idModelModule: rem.id,
                                        modelModule: 'rem',
                                        type: 'Rem',
                                        assignedTo: participant.member.id
                                    };
                                });
                                NotificationService.sendNotifications(notificationList);
                            });
                        }
                        return res.send({ ok: true, msg: 'REM.SUCCESS.UPDATE', obj: rem });
                    }
                });
            }, err => res.send({ ok: false, obj: err }));
        } else {
            rem.createdBy = req.session.employee.id;
            Rem.create(rem).exec(function (err, newRem) {
                if (err) {
                    return res.send({ ok: false, msg: 'REM.ERROR.CREATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'REM.SUCCESS.CREATE', obj: newRem });
                }
            });
        }
    },
    /**
     * Crear un incidente rechazado
     */
    saveRejected: (req, res) => {
        let opts = req.body.opts;
        if (!opts) { return res.send({ ok: false }); }
        Rem.create({
            status: 5, // Rechazado
            createdBy: req.session.employee.id
        }).then(remCreated => {
            RemLog.create({
                rem: remCreated.id,
                createdBy: req.session.employee.id,
                type: 'statusChanged',
                comment: opts.comment,
                reason: opts.reason,
                status: 5
            }).exec(() => { });
            res.send({ ok: true, obj: remCreated });
        }).catch(err => res.send({ ok: false, obj: err }));
    },
    getVehiclePatientList: function (req, res) {
        let idRem = req.body.idRem;
        if (!idRem) return res.badRequest('');
        async.parallel({
            remPatients: cb => {
                RemPatient.find({ rem: idRem, deleted: false }).then(remPatientList => {
                    async.forEach(remPatientList, (remPatient, cb) => {
                        Patient.findOne(remPatient.patient).populate('address').then(patient => {
                            remPatient.patient = patient;
                            cb();
                        }, cb);
                    }, err => {
                        if (err) { return cb(err); }
                        cb(null, remPatientList);
                    });
                }, cb);
            },
            remVehicles: cb => {
                RemVehicle.find({ rem: idRem, deleted: false })
                    .populate('establishment')
                    .populate('deliveryEstablishment')
                    .populate('status')
                    .populate('vehicle')
                    .then(remVehicleList => {
                        remVehicleList = _.map(remVehicleList, remVehicle => remVehicle.toJSON());
                        async.forEach(remVehicleList, (remVehicle, cb) => {
                            ParticipantService.getList({
                                remVehicle: remVehicle.id
                            }).then(participantList => {
                                remVehicle.participantList = participantList;
                                cb();
                            }).catch(cb);
                        }, err => cb(err, remVehicleList));
                    }, cb);
            }
        }, (err, results) => {
            if (err) {
                res.send({ ok: false, obj: err })
            } else {
                res.send({ ok: true, obj: results })
            }
        });
    },
    saveRemVehicle: async (req, res) => {
        let remVehicle = req.body.remVehicle;
        if (_.isEmpty(remVehicle)) { return res.badRequest(); }

        try {
            var remVehicleFinded;
            var remVehicleSaved;
            if (remVehicle.id) {
                remVehicleFinded = await RemVehicle.findOne(remVehicle.id);
                remVehicleSaved = (await RemVehicle.update(remVehicle.id, _.pick(remVehicle, [
                    'status',
                    'vehicle',
                    'establishment',
                    'deliveryEstablishment',
                    'kmDeparture',
                    'kmArrival',
                    'requestDescription',
                    'requestedType',
                    'deliveredType',
                    'isPrivate',
                    'particularDescription',
                    'deleted'
                ]))).pop();

                // Si el despacho no tenía un vehículo seleccionado y ahora lo tiene se debe actualizar datos del vehículo
                if (!remVehicleFinded.vehicle && remVehicleSaved.vehicle) {
                    await Vehicle.update(remVehicleSaved.vehicle, {
                        status: remVehicleSaved.status,
                        currentRemVehicle: remVehicleSaved.id,
                        currentRem: remVehicleSaved.rem
                    });
                }

                // Si el despacho fue eliminado se deben deasociar los pacientes
                if (remVehicleSaved.deleted) {
                    let remPatientUpdatedList = await RemPatient.update({
                        vehicle: remVehicleSaved.id
                    }, {
                            vehicle: null
                        });

                    await remPatientUpdatedList.map(remPatient => {
                        return RemLogPatient.create({
                            rem: remPatient.rem,
                            remPatient: remPatient.id,
                            patient: remPatient.patient,
                            createdBy: req.session.employee.id,
                            data: JSON.stringify(remPatient),
                            type: 'patientEdited'
                        });
                    });
                }
            } else {
                remVehicleSaved = await RemVehicle.create(remVehicle);
            }

            var manageParticipant = async (participant) => {
                if (participant.id && participant.deleted) {
                    // Actualizar si el participante existe y es eliminado de la tripulación
                    await Participant.update(participant.id, { deleted: true });
                } else if (!participant.id) {
                    // Buscar participante eliminado para reactivar o crear participante
                    let participantCreated = await Participant.findOrCreate({
                        remVehicle: participant.remVehicle,
                        member: participant.member
                    }, participant);

                    // Enviar notificación de sistema
                    NotificationService.sendNotifications({
                        title: '<span><b>' + req.session.employee.fullname + '</b> te agregó a un despacho SAMU</span>',
                        idModelModule: remVehicle.rem,
                        modelModule: 'rem',
                        type: 'Rem',
                        assignedTo: participantCreated.member
                    });

                    // Actualizar campo deleted si estaba eliminado
                    if (participantCreated.deleted) {
                        await Participant.update(participantCreated.id, { deleted: false });
                    }
                }
            };

            // Manejo de participantes en tripulación del despacho
            await Promise.all((remVehicle.participantList || []).map(participant => manageParticipant(participant)));

            // Finalizar despachos antiguos del mismo vehículo
            if (!remVehicleFinded || (!remVehicleFinded.vehicle && remVehicleSaved.vehicle)) {
                let olderRemVehicleList = await RemVehicle.update({
                    id: { '!': remVehicleSaved.id },
                    vehicle: remVehicleSaved.vehicle,
                    status: [3, 4, 5, 6, 7] // ensalida
                }, { status: 8 });

                await olderRemVehicleList.map(remVehicleItem => {
                    return RemLogVehicle.create({
                        rem: remVehicleItem.rem,
                        remVehicle: remVehicleItem.id,
                        vehicle: remVehicleItem.vehicle,
                        createdBy: req.session.employee.id,
                        status: 8,
                        type: 'vehicleStatusChanged'
                    });
                });
            }

            // Registrar log de la acción
            let type = 'vehicleEdited';
            if (!remVehicleFinded) { type = 'vehicleCreated' };
            if (remVehicleSaved.deleted) { type = 'vehicleRemoved' };
            if (remVehicleFinded && remVehicleFinded.status !== remVehicleSaved.status) { type = 'vehicleStatusChanged' };
            await RemLogVehicle.create({
                rem: remVehicleSaved.rem,
                remVehicle: remVehicleSaved.id,
                status: remVehicleSaved.status,
                vehicle: remVehicleSaved.vehicle,
                createdBy: req.session.employee.id,
                type: type
            });

            res.ok();
        } catch (err) {
            res.serverError(err);
        }
    },
    saveRemPatient: (req, res) => {
        let remPatient = req.body.remPatient;
        let logType = req.body.logType;

        if (!remPatient) {
            return res.badRequest();
        }

        var responseReq = idRemPatient => {
            RemPatient
                .findOne(idRemPatient)
                .populate('patient')
                .then(remPatient => res.send({ ok: true, obj: remPatient }))
                .catch(err => res.send({ ok: false, obj: err }));
        };

        RemPatient.update(remPatient.id, remPatient).then(
            remPatientUpdatedList => {
                let remPatientUpdated = remPatientUpdatedList.pop();
                RemLogPatient.create({
                    rem: remPatientUpdated.rem,
                    remPatient: remPatientUpdated.id,
                    patient: remPatientUpdated.patient,
                    remVehicle: remPatientUpdated.vehicle,
                    createdBy: req.session.employee.id,
                    type: logType
                }).exec(() => { });
                responseReq(remPatientUpdated.id);
            },
            err => {
                sails.log(err);
                res.send({ ok: false, obj: err });
            }
        );
    },
    getTimeline: function (req, res) {

        let idRem = req.body.idRem;

        var getRemLog = cb => {
            RemLog
                .find({ rem: idRem, deleted: false })
                .populate('createdBy')
                .populate('status')
                .exec(cb);
        };

        var getRemLogVehicle = cb => {
            RemLogVehicle
                .find({ rem: idRem, deleted: false })
                .populate('createdBy')
                .populate('vehicle')
                .populate('status')
                .exec(cb);
        };

        var getRemLogPatient = cb => {
            RemLogPatient
                .find({ rem: idRem, deleted: false })
                .populate('createdBy')
                .populate('patient')
                .then(remLogPatientList => {
                    async.forEach(remLogPatientList, (remLogPatient, cb) => {
                        if (!remLogPatient.remVehicle) {
                            return async.setImmediate(cb);
                        }
                        RemVehicle.findOne(remLogPatient.remVehicle).populate('vehicle').then(
                            remVehicle => {
                                remLogPatient.remVehicle = remVehicle;
                                cb();
                            }, cb
                        );
                    }, err => cb(err, remLogPatientList));
                }, cb);
        };

        var getComments = cb => {
            Comment
                .find({ idModelModule: idRem, modelModule: 'rem', deleted: false })
                .populate('createdBy')
                .populate('attachments')
                .exec(cb);
        };

        async.parallel({
            comments: getComments,
            logPatient: getRemLogPatient,
            logVehicle: getRemLogVehicle,
            logRem: getRemLog
        }, (err, results) => {
            if (err) {
                return res.send({ ok: false, msg: '', obj: '' });
            } else {
                return res.send({ ok: true, msg: '', obj: results });
            }
        });
    },
    getDynamic: function (req, res) {
        var paginate = {
            page: req.body.page || 1,
            limit: 16
        };
        var filter = _.omit(req.body.filter, _.isNull) || {};
        var criteria = _.extend({ deleted: false },
            _.pick(filter, ['createdBy']),
            filter.searchText ? { description: { contains: filter.searchText } } : {}
        );

        // Filtro fecha mínima
        if (filter.minDate) {
            var minDate = new Date(filter.minDate);
            minDate.setHours(0, 0, 0, 0);
            _.merge(criteria, {
                createdAt: {
                    '>=': minDate
                }
            });
        }
        // Filtro fecha máxima
        if (filter.maxDate) {
            var maxDate = new Date(filter.maxDate);
            maxDate.setHours(23, 59, 59, 0);
            _.merge(criteria, {
                createdAt: {
                    '<=': maxDate
                }
            });
        }

        let getStatus = function (cb) {
            let statusFilter = {
                deleted: false,
                finished: filter.finished
            };
            _.extend(statusFilter, !_.isEmpty(filter.status) ? { id: filter.status } : {});
            RemStatus.find(statusFilter).then(
                status => cb(null, _.map(status, 'id')),
                err => cb(null, [])
            );
        };

        let getAddress = function (cb) {
            if (!filter.commune) { return async.setImmediate(() => cb(null, [])); }
            Address.find({ select: ['id'], district: filter.commune }).then(
                addressList => cb(null, _.map(addressList, 'id')),
                err => cb(null, [])
            );
        };

        // Filtros previos
        async.parallel({
            status: getStatus,
            address: getAddress
        }, function (err, results) {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, msg: '', obj: '' });
            }
            criteria.status = results.status;
            if (!_.isEmpty(results.address)) { criteria.originAddress = results.address; }

            async.parallel({
                count: (cb) => {
                    Rem
                        .count(criteria)
                        .exec(cb);
                },
                data: (cb) => {
                    Rem
                        .find(criteria)
                        .sort('id DESC')
                        .paginate(paginate)
                        .populate('callReason')
                        .populate('subCallReason')
                        .populate('status')
                        .exec((err, rems) => {
                            if (err) { return cb(err); }
                            let remIds = _.map(rems, 'id');
                            async.parallel({
                                addressList: cb => {
                                    let addressIds = _.map(rems, 'originAddress') || [];
                                    Address.find({ id: addressIds }).populate('district').exec(cb);
                                },
                                remPatients: cb => {
                                    RemPatient
                                        .find({ rem: remIds, deleted: false })
                                        .populate('patient')
                                        .exec(cb)
                                },
                                remVehicles: cb => {
                                    RemVehicle
                                        .find({ rem: remIds, deleted: false })
                                        .populate('vehicle')
                                        .exec(cb)
                                }
                            }, (err, results) => {
                                let tmpRems = [];
                                rems.forEach(rem => {
                                    let tmpRem = rem.toJSON();
                                    tmpRem.patients = _.map(_.filter(results.remPatients, { rem: rem.id }), remPatient => {
                                        return (remPatient.patient ? remPatient.patient.toJSON() : null);
                                    });
                                    tmpRem.remVehicles = _.filter(results.remVehicles, { rem: rem.id });
                                    tmpRem.originAddress = tmpRem.originAddress ? _.find(results.addressList, { id: tmpRem.originAddress }) : {};
                                    tmpRems.push(tmpRem);
                                });
                                cb(null, tmpRems);
                            });
                        });
                }
            }, function (err, results) {
                if (err) {
                    sails.log(err);
                    return res.send({ ok: false, obj: err });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'REM.SEARCH.FOUND',
                        obj: { rems: results.data || [], count: results.count }
                    });
                }
            });
        });
    },
    getCallReasons: function (req, res) {
        CallReason.find({
            deleted: false
        }).then(
            (callReasons) => res.send({ ok: true, obj: callReasons }),
            (err) => res.send({ ok: false, obj: err })
        );
    },
    getSubCallReasons: (req, res) => {
        let callReason = req.body.callReason;
        SubCallReason.find({
            callReason: callReason,
            deleted: false
        }).then(
            subCallReasons => res.send({ ok: true, obj: subCallReasons }),
            err => res.send({ ok: false, obj: err })
        );
    },
    getApplicantTypes: function (req, res) {
        ApplicantType.find({
            deleted: false
        }).then(
            (applicantTypes) => res.send({ ok: true, obj: applicantTypes }),
            (err) => res.send({ ok: false, obj: err })
        );
    },
    getRemStatus: function (req, res) {
        RemStatus.find({
            deleted: false
        }).populate('supervisorList').then(
            (status) => res.send({ ok: true, obj: status }),
            (err) => res.send({ ok: false, obj: err })
        );
    },
    /**
     * Obtener detalle del Incidente
     */
    get: function (req, res) {
        let idRem = req.body.idRem;
        if (!idRem) { return res.send({ ok: false, obj: {} }) }

        let moment = require('moment');

        RemAccess.findOrCreate({
            rem: idRem,
            createdAt: { '>': moment().startOf('hour').toDate() },
            employee: req.session.employee.id,
            ip: req.ip
        }, {
                rem: idRem,
                employee: req.session.employee.id,
                ip: req.ip
            }).then(remAccess => {
                if (_.isEmpty(remAccess)) { return; }
                if (_.isArray(remAccess)) { remAccess = remAccess.pop(); }
                remAccess.count++;
                remAccess.save(() => { });
            }, err => sails.log(err));

        Rem
            .findOne(idRem)
            .populate('createdBy')
            .populate('status')
            .populate('callReason')
            .populate('subCallReason')
            .populate('applicantType')
            .then((rem) => {
                if (rem.originAddress) {
                    Address.findOne(rem.originAddress)
                        .populate('state')
                        .populate('district')
                        .then(address => {
                            res.ok(Object.assign(rem, { originAddress: address }));
                        });
                } else {
                    res.ok(rem);
                }
            },
                (err) => res.send({ ok: false, obj: err })
            );
    },
    getEcg: (req, res) => {
        Ecg
            .find({ deleted: false })
            .then(
                (ecgs) => res.send({ ok: true, obj: ecgs }),
                (err) => res.send({ ok: false, obj: err })
            );
    },
    /**
     * Agregar múltiples pacientes NN a un REM
     */
    createMultiplePatients: (req, res) => {
        let patientsToCreate = req.body.patientsToCreate;
        let idRem = req.body.idRem;
        Rem.findOne(idRem).then(rem => {
            let remPatients = [];
            for (let i = 0; i < patientsToCreate; ++i) {
                remPatients.push({
                    incrementalID: ++rem.patientsIncremental,
                    rem: idRem,
                    patient: { identificationType: 'nn' },
                    vehicle: null
                });
            }
            RemPatient.create(remPatients)
                .then(
                    remPatients => {
                        remPatients.forEach(remPatient => remPatient.patient = {
                            id: remPatient.patient,
                            identificationType: 'nn'
                        });
                        Rem.message(idRem, {
                            message: 'multiplePatientsCreated',
                            data: remPatients
                        })
                        res.send({ ok: true, obj: remPatients });
                    },
                    err => res.send({ ok: false, obj: err })
                );
            rem.save();
        }).catch(err => res.send({ ok: false, obj: err }));
    },
    getRegulatorObservations: (req, res) => {
        let idRemPatient = req.body.remPatient;
        if (!idRemPatient) { return res.send({ ok: false, obj: {} }); }
        RegulatorObservation
            .find({ remPatient: idRemPatient })
            .populate('createdBy')
            .then(
                (observations) => res.send({ ok: true, obj: observations }),
                (err) => res.send({ ok: false, obj: err })
            );
    },
    saveRegulatorObservations: (req, res) => {
        if (req.body.regulator) {
            req.body.regulator.createdBy = req.session.employee.id;
            RegulatorObservation
                .create(req.body.regulator)
                .then(
                    observations => res.send({ ok: true, msg: '', obj: observations }),
                    err => res.send({ ok: false, msg: '', obj: err })
                );
        } else {
            return res.badRequest();
        }
    },
    addComment: function (req, res) {

        let { comment, mentionedList } = req.body;
        if (!comment) {
            return res.send({ ok: false });
        }
        // set createdBy value
        comment.createdBy = req.session.employee.id;

        Comment.create(comment).exec(function (err, commentCreated) {
            if (err) {
                return res.send({ ok: false, msg: 'COMMENT.ERROR.CREATE', obj: err });
            } else {
                comment.createdBy = _.pick(req.session.employee, ['id', 'fullname', 'hasProfilePicture']);
                Rem.message(comment.idModelModule, {
                    message: 'rem:new-comment',
                    data: { ...commentCreated, ...comment }
                });
                return res.send({ ok: true, msg: 'COMMENT.SUCCESS.CREATE', obj: comment });
            }
        });

        if (_.isEmpty(mentionedList)) { return; }

        let notificationList = mentionedList.map(idEmployee => {
            return {
                title: '<span><b>' + req.session.employee.fullname + '</b> te mencionó en un incidente SAMU</span>',
                idModelModule: comment.idModelModule,
                modelModule: 'rem',
                type: 'Rem',
                assignedTo: idEmployee
            };
        });

        NotificationService.sendNotifications(notificationList);
    },
    subscribe: function (req, res) {
        let idRem = req.body.idRem;
        if (!idRem) {
            return res.send({ ok: false });
        }
        Rem.subscribe(req, [idRem]);
        return res.send({ ok: true, msg: 'NOTIFICATION.SUBSCRIBE.OK', obj: {} });
    },
    saveRemPatientIntervention: (req, res) => {
        let remPatient = _.pick(req.body.remPatient, [
            'id',
            'descriptionIntervention',
            'diagnosticIntervention',
            'typeTransfer',
            'setAttentions',
            'transferStatus',
            'criticalIntervention',
            'adhocCall'
        ]);
        if (!remPatient) {
            return res.badRequest();
        }

        // Se definen variables a utilizar
        var addTransferStatus = [];
        var removeTransferStatus = [];

        /* Recorro los estados de traslado para separar
        cuales se agregan y cuales se borran */
        _.map(remPatient.transferStatus, status => {
            if (!status.deleted) {
                addTransferStatus.push(status.id);
            } else {
                removeTransferStatus.push(status.id);
            }
        });

        /* Quito atenciones y estado de traslado,
        estos se guardan en rutina aparte */
        var setAttentions = remPatient.setAttentions;
        delete remPatient.transferStatus;
        delete remPatient.setAttentions;

        // Rutina que guarda atenciones
        var saveAttentions = (cb, setAttentions, idRemPatient) => {
            if (!setAttentions) {
                return async.setImmediate(() => cb(null, []));
            }
            async.each(setAttentions, (attention, callback) => {
                if (attention.attentionItem && (attention.id || attention.deleted === false)) {
                    attention.remPatient = idRemPatient;
                    attention.observation = attention.deleted ? '' : attention.observation;
                    AttentionProvided
                        .findOne({
                            remPatient: idRemPatient,
                            attentionItem: attention.attentionItem
                        })
                        .then(
                            provided => {
                                if (provided) {
                                    AttentionProvided
                                        .update(provided.id, attention)
                                        .then(
                                            () => callback(),
                                            err => callback(err)
                                        );
                                } else {
                                    AttentionProvided
                                        .create(attention)
                                        .then(
                                            () => callback(),
                                            err => callback(err)
                                        );
                                }
                            },
                            err => callback(err)
                        );
                } else {
                    callback();
                }
            },
                err => {
                    if (err) {
                        cb(err);
                    } else {
                        AttentionProvided
                            .find({ remPatient: idRemPatient })
                            .populate('attentionItem')
                            .then(
                                response => cb(null, response),
                                err => cb(err)
                            );
                    }
                });
        };

        // Rutina que guarda estados de traslado
        var saveTransferStatus = (cb, remPatientUpdated) => {
            remPatientUpdated.transferStatus.add(addTransferStatus);
            remPatientUpdated.transferStatus.remove(removeTransferStatus);
            remPatientUpdated.save(err => {
                if (err) {
                    cb(err);
                } else {
                    RemPatient
                        .findOne({ id: remPatientUpdated.id })
                        .populate('transferStatus')
                        .then(
                            remPatient => {
                                cb(null, remPatient.transferStatus)
                            },
                            err => cb(err)
                        );
                }
            });
        };

        remPatient.hasIntervention = true;

        if (remPatient.id) {
            RemPatient
                .update(remPatient.id, remPatient)
                .then(
                    remPatientUpdatedList => {
                        let remPatientUpdated = remPatientUpdatedList.pop();
                        async.parallel({
                            transferStatus: cb => saveTransferStatus(cb, remPatientUpdated),
                            attentions: cb => saveAttentions(cb, setAttentions, remPatientUpdated.id)
                        },
                            (err, result) => {
                                if (err) {
                                    res.send({ ok: false, obj: err });
                                } else {
                                    RemLogPatient.create({
                                        rem: remPatientUpdated.rem,
                                        remPatient: remPatientUpdated.id,
                                        patient: remPatientUpdated.patient,
                                        createdBy: req.session.employee.id,
                                        data: JSON.stringify(_.merge(remPatient, {
                                            transferStatus: result.transferStatus,
                                            setAttentions: result.attentions
                                        })),
                                        type: 'patientIntervention'
                                    }).exec(() => { });
                                    remPatientUpdated.setAttentions = result.attentions;
                                    res.send({ ok: true, obj: remPatientUpdated });
                                }
                            });
                    },
                    err => {
                        sails.log(err);
                        res.send({ ok: false, obj: err });
                    }
                );
        } else {
            res.send({ ok: false, obj: {}, msg: 'No existe remPatient' });
        }
    },
    saveRemPatientBasicEvolution: (req, res) => {
        let remPatient = _.pick(req.body.remPatient, [
            'id',
            'triage',
            'triageObservation'
        ]);

        if (!remPatient) {
            return res.badRequest();
        }

        remPatient.hasIntervention = true;

        if (remPatient.id) {
            RemPatient
                .update(remPatient.id, remPatient)
                .then(
                    remPatientUpdatedList => {
                        let remPatientUpdated = remPatientUpdatedList.pop();
                        RemLogPatient.create({
                            rem: remPatientUpdated.rem,
                            remPatient: remPatientUpdated.id,
                            patient: remPatientUpdated.patient,
                            createdBy: req.session.employee.id,
                            data: JSON.stringify(remPatient),
                            type: 'patientBasicEvolution'
                        }).exec(() => { });
                        res.send({ ok: true, obj: remPatientUpdated });
                    },
                    err => {
                        sails.log(err);
                        res.send({ ok: false, obj: err });
                    }
                );
        } else {
            res.send({ ok: false, obj: {}, msg: 'No existe remPatient' });
        }
    },
    saveRemPatientVitalSigns: (req, res) => {
        let moment = require('moment');
        let remPatient = _.pick(req.body.remPatient, [
            'id',
            'vitalSigns'
        ]);

        if (!remPatient) {
            return res.badRequest();
        }

        remPatient.hasIntervention = true;

        if (remPatient.id && remPatient.vitalSigns && !_.isEmpty(remPatient.vitalSigns)) {
            remPatient.vitalSigns.takenAt = moment(remPatient.vitalSigns.takenAt || null).isValid() ? remPatient.vitalSigns.takenAt : new Date();
            remPatient.vitalSigns.remPatient = remPatient.id;
            remPatient.vitalSigns.createdBy = req.session.employee.id;
            VitalSigns
                .create(remPatient.vitalSigns)
                .then(
                    response => {
                        RemPatient
                            .findOne(remPatient.id)
                            .then(remPatientUpdated => {
                                RemLogPatient.create({
                                    rem: remPatientUpdated.rem,
                                    remPatient: remPatientUpdated.id,
                                    patient: remPatientUpdated.patient,
                                    createdBy: req.session.employee.id,
                                    data: JSON.stringify(remPatient.vitalSigns),
                                    type: 'patientVitalSigns'
                                }).exec(() => { });
                            });
                        VitalSigns
                            .findOne({ id: response.id })
                            .populate('createdBy')
                            .then(
                                vitalSigns => res.send({ ok: true, obj: vitalSigns }),
                                err => res.send({ ok: false, msg: 'Ha ocurrido un error', obj: err })
                            );
                    },
                    err => res.send({ ok: false, obj: err })
                );
        } else {
            res.send({ ok: false, obj: {}, msg: 'Error: no existe remPatient o datos incompletos' });
        }
    },
    saveRemPatientMedicines: (req, res) => {
        let remPatient = _.pick(req.body.remPatient, [
            'id',
            'medicines'
        ]);

        if (!remPatient.id || !(remPatient.medicines.medicine || {}).id) {
            return res.send({ ok: false, obj: {}, msg: 'Error: datos incompletos' });
        }

        remPatient.medicines.prescribed = remPatient.id;
        remPatient.medicines.medicine = remPatient.medicines.medicine.id;
        remPatient.medicines.createdBy = req.session.employee.id;
        remPatient.hasIntervention = true;

        if (remPatient.id) {
            RemPatientMedicines
                .create(remPatient.medicines)
                .then(
                    response => {
                        RemPatient
                            .findOne(remPatient.id)
                            .then(remPatientUpdated => {
                                RemLogPatient.create({
                                    rem: remPatientUpdated.rem,
                                    remPatient: remPatientUpdated.id,
                                    patient: remPatientUpdated.patient,
                                    createdBy: req.session.employee.id,
                                    data: JSON.stringify(remPatient.medicines),
                                    type: 'addPatientMedicine'
                                }).exec(() => { });
                            });
                        RemPatientMedicines
                            .find({ id: response.id })
                            .populate('medicine')
                            .populate('via')
                            .populate('createdBy')
                            .then(
                                medicine => res.send({ ok: true, obj: medicine }),
                                err => res.send({ ok: false, msg: 'Ha ocurrido un error', obj: err })
                            );
                    },
                    err => res.send({ ok: false, obj: err })
                );
        } else {
            res.send({ ok: false, obj: {}, msg: 'Error: no existe remPatient o datos incompletos' });
        }
    },
    deleteRemPatientMedicines: (req, res) => {
        let remPatient = _.pick(req.body.remPatient, [
            'id',
            'medicines'
        ]);

        if (!remPatient) {
            return res.badRequest();
        }

        if (remPatient.medicines && remPatient.medicines.id) {
            RemPatientMedicines
                .update({ id: remPatient.medicines.id }, { deleted: true })
                .exec(err => {
                    if (err) {
                        return res.send({ msg: '', ok: false, obj: { error: err } });
                    } else {
                        RemPatient
                            .findOne(remPatient.id)
                            .then(remPatientUpdated => {
                                RemLogPatient.create({
                                    rem: remPatientUpdated.rem,
                                    remPatient: remPatientUpdated.id,
                                    patient: remPatientUpdated.patient,
                                    createdBy: req.session.employee.id,
                                    data: JSON.stringify(remPatient.medicines),
                                    type: 'removePatientMedicine'
                                }).exec(() => { });
                                res.send({ ok: true, obj: {}, msg: 'medicina borrada' });
                            })
                            .catch(err => {
                                res.send({ ok: false, obj: err });
                            });
                    }
                });
        } else {
            res.send({ ok: false, obj: {}, msg: 'No existe remPatient medicine' });
        }
    },
    /**
     * Obtener reporte de incidentes con mapa de calor
     */
    getHeatMap: (req, res) => {
        let filter = req.body.filter;
        Rem.find({
            createdAt: {
                '>': new Date(filter.fromDate),
                '<': new Date(filter.toDate)
            },
            deleted: false
        }).then(rems => res.send({
            ok: true,
            obj: _.remove(_.map(rems, 'position'), null)
        }), err => res.send({ ok: false, obj: err }));
    },
    /**
     * Obtener reporte de incidentes por motivo de llamada
     */
    getReportByCallReason: (req, res) => {
        let filter = req.body.filter;
        CallReason.find().then(callReasonList => {
            async.each(callReasonList, (callReason, cb) => {
                Rem.count({
                    callReason: callReason.id,
                    createdAt: {
                        '>': new Date(filter.fromDate),
                        '<': new Date(filter.toDate)
                    },
                    deleted: false
                }).then(remCount => {
                    callReason.remCount = remCount;
                    cb();
                }, err => cb(err));
            }, err => {
                if (err) { return res.send({ ok: false }) }
                res.send({ ok: true, obj: callReasonList });
            });
        }, err => res.send({ ok: false, obj: err }));
    },
    /**
     * Obtener reporte de traslados
     */
    getTransferReport: (req, res) => {
        let filter = req.body.filter;
        Rem.find({
            status: { '!': 5 },
            createdAt: {
                '>': new Date(filter.fromDate),
                '<': new Date(filter.toDate)
            },
            deleted: false
        }).then(remList => {

            let remsSecondaryIds = _.map(_.remove(remList, { callReason: 6 }), 'id');
            let remsPrimaryIds = _.map(remList, 'id');

            let getCount = (remsIds, cb) => {
                let typeList = [
                    { name: 'm1' },
                    { name: 'm2' },
                    { name: 'm3' },
                    { name: 'x5' }
                ];

                async.each(typeList, (type, cb) => {
                    RemVehicle.count({
                        status: { '!': 10 },
                        rem: remsIds,
                        deliveredType: type.name,
                        deleted: false,
                        vehicle: { '!': null }
                    }).then(count => {
                        type.count = count;
                        cb();
                    }, err => cb(err));
                }, err => {
                    cb(err, typeList);
                });
            };

            async.parallel({
                primary: cb => getCount(remsPrimaryIds, cb),
                secondary: cb => getCount(remsSecondaryIds, cb)
            }, (err, results) => {
                if (err) { return res.send({ ok: false }) }
                res.send({ ok: true, obj: results });
            });
        });
    },
    /**
     * Obtener reporte de llamadas válidas/inválidas
     */
    getCallReport: (req, res) => {
        let filter = req.body.filter;
        async.parallel({
            validCount: cb => Rem.count({
                status: { '!': 5 },
                createdAt: {
                    '>': new Date(filter.fromDate),
                    '<': new Date(filter.toDate)
                }
            }).exec(cb),
            invalidCount: cb => Rem.count({
                status: 5,
                createdAt: {
                    '>': new Date(filter.fromDate),
                    '<': new Date(filter.toDate)
                }
            }).exec(cb)
        }, (err, results) => {
            if (err) { return res.send({ ok: false }) }
            res.send({
                ok: true,
                obj: [{
                    name: 'Válidas',
                    count: results.validCount
                }, {
                    name: 'Inválidas',
                    count: results.invalidCount
                }]
            })
        });
    },
    /**
     * Obtener reporte base para generar REM 08
     */
    getBaseReport: (req, res) => {
        var moment = require('moment');
        let dates = req.body.dates;
        if (!dates) { return res.send({ ok: false }); }
        let fromDate = moment(dates.fromDate).format('YYYY-MM-DD');
        let toDate = moment(dates.toDate).format('YYYY-MM-DD');
        /**
         * Query a SP generado por Vladimir
         */
        Rem.query("select * from fnbasicreport('" + fromDate + "','" + toDate + "')", function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send({ ok: true, obj: result.rows });
            }
        });
    },
    /**
     * Obtener reporte de traslados sin paciente asociado
     */
    getTransferWithoutPatientReport: (req, res) => {
        var moment = require('moment');
        let dates = req.body.dates;
        if (!dates) { return res.send({ ok: false }); }
        let fromDate = moment(dates.fromDate).format('YYYY-MM-DD');
        let toDate = moment(dates.toDate).format('YYYY-MM-DD');
        /**
         * Query a SP generado por Vladimir
         */
        Rem.query("select * from fnnopatient('" + fromDate + "','" + toDate + "')", function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send({ ok: true, obj: result.rows });
            }
        });
    },
    /**
     * Obtener reporte REM08
     */
    getRemEight: (req, res) => {
        var moment = require('moment');
        let dates = req.body.dates;
        if (!dates) { return res.send({ ok: false }); }
        let fromDate = moment(dates.fromDate).format('YYYY-MM-DD');
        let toDate = moment(dates.toDate).format('YYYY-MM-DD');

        async.parallel({
            sectionK: cb => {
                Rem.query("select * from fnsectionk('" + fromDate + "','" + toDate + "')", cb);
            },
            sectionL: cb => {
                Rem.query("select * from fnsectionl('" + fromDate + "','" + toDate + "')", cb);
            },
            sectionM: cb => {
                Rem.query("select * from fnsectionm('" + fromDate + "','" + toDate + "')", cb);
            },
            sectionN: cb => {
                Rem.query("select * from fnsectionn('" + fromDate + "','" + toDate + "')", cb);
            }
        }, (err, results) => {
            if (err) { return res.send({ ok: false, obj: err }) }
            return res.send({
                ok: true, obj: {
                    sectionK: results.sectionK.rows,
                    sectionL: results.sectionL.rows,
                    sectionM: results.sectionM.rows,
                    sectionN: results.sectionN.rows
                }
            });
        });
    },
    getEmployeeReport: (req, res) => {
        var getRemLog = cb => {
            RemLog
                .find({ deleted: false })
                .exec(cb);
        };

        var getRemLogVehicle = cb => {
            RemLogVehicle
                .find({ deleted: false })
                .exec(cb);
        };

        var getRemLogPatient = cb => {
            RemLogPatient
                .find({ deleted: false })
                .exec(cb);
        };

        var getComments = cb => {
            RemComment
                .find({ deleted: false })
                .exec(cb);
        };

        var getRems = cb => {
            Rem
                .find({ deleted: false })
                .exec(cb);
        };

        async.parallel({
            comments: getComments,
            logPatient: getRemLogPatient,
            logVehicle: getRemLogVehicle,
            logRem: getRemLog,
            getRems: getRems
        }, (err, results) => {
            if (err) {
                return res.send({ ok: false, msg: '', obj: '' });
            } else {
                let list = [].concat(results.comments, results.logPatient, results.logVehicle, results.logRem, results.getRems);
                let groupedList = _.countBy(list, 'createdBy');
                let employeeList = [];
                Employee.find({ id: _.keys(groupedList) }).then(employeeListFinded => {
                    employeeListFinded.forEach(employeeItem => {
                        employeeList.push({
                            fullname: employeeItem.fullname,
                            searchText: employeeItem.searchText,
                            counter: groupedList[employeeItem.id]
                        });
                    });
                    return res.send({ ok: true, msg: '', obj: _.sortBy(employeeList, 'counter') });
                });
            }
        });
    }
};

