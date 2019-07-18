/**
 * ParticipantController
 *
 * @description :: Server-side logic for managing Participants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    /**
     * Agregar un nuevo participante
     */
    add: (req, res) => {
        let { participant } = req.body;

        let logType = "participantAdded";

        async.series({
            autocompleteTime: cb => {
                if (!participant.workshift) { return async.setImmediate(cb); }
                // Obtener datos de turno (fecha inicio y término) para asignar al participante
                Workshift.findOne(participant.workshift).then(workshift => {
                    Object.assign(participant, _.pick(workshift, ['startTime', 'endTime']));
                    cb();
                }, cb);
            },
            validateCurrentParticipant: cb => {
                // Buscar al mismo miembro como participante del turno
                Participant.findOne(_.pick(participant, ['workshift', 'member', 'deleted'])).then(participantFinded => {

                    // No se encontró al mismo miembro en el turno, se continua la operación
                    if (_.isEmpty(participantFinded)) { return cb(); }

                    // Se encontró en el mismo team, por tanto se cancela la operación de ingreso
                    if (participantFinded.careTeam === participant.careTeam) {
                        return cb(new Error('El participante ya existe en el turno y vehículo'));
                    } else {
                        // Se encontró en otro team, por tanto se remueve
                        logType = "participantMoved";
                        participantFinded.deleted = true;
                        participantFinded.save(err => {
                            if (!err) {
                                Workshift.message(participantFinded.workshift, {
                                    message: 'participantRemoved',
                                    data: {
                                        idParticipant: participantFinded.id
                                    }
                                });
                            }
                            cb(err);
                        });
                    }
                }, cb);
            },
            createParticipant: cb => {
                Participant.create(participant).then(participantCreated => {

                    CareTeam.findOne(participantCreated.careTeam).then(careTeam => {
                        // Creación de log asociado al turno
                        WorkshiftLog.create({
                            type: logType,
                            member: participantCreated.member,
                            vehicle: careTeam ? careTeam.vehicle : null,
                            createdBy: req.session.employee.id,
                            workshift: participantCreated.workshift
                        }).exec(() => { });
                    }, err => sails.log(err));

                    ParticipantService.getList({ id: participantCreated.id }).then(participantList => {
                        let participant = participantList.pop();
                        Workshift.message(participant.workshift, {
                            message: 'participantAdded',
                            data: {
                                participant: participant
                            }
                        });
                    });
                    cb(null, participantCreated);
                }, cb);
            }
        }, (err, results) => {
            if (err) { return res.serverError(err); }
            res.ok(results.createParticipant);
        });
    },
    /**
     * Remover un participante
     */
    remove: (req, res) => {
        let { idParticipant } = req.body;
        if (!idParticipant) { return res.badRequest(); }
        Participant.update(idParticipant, { deleted: true }).then(participantUpdated => {
            if (_.isEmpty(participantUpdated)) {
                res.serverError();
            } else {

                Workshift.message(participantUpdated[0].workshift, {
                    message: 'participantRemoved',
                    data: {
                        idParticipant: participantUpdated[0].id
                    }
                });

                // Creación de log asociado al turno
                WorkshiftLog.create({
                    type: 'participantRemoved',
                    member: participantUpdated[0].member,
                    vehicle: null,
                    createdBy: req.session.employee.id,
                    workshift: participantUpdated[0].workshift
                }).exec(() => { });

                // Envío de respuesta al cliente
                res.ok();
            }
        }, err => res.serverError(err));
    }
};

