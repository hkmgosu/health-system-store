/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    createEvent: (req, res) => {
        if (!req.body.eventForm ||
            !(req.body.eventForm || {}).eventData ||
            !(req.body.eventForm || {}).formData) {
            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.SAVE' });
        }
        var eventData = req.body.eventForm.eventData;
        var formData = req.body.eventForm.formData;
        var anonimo = req.body.eventForm.eventData.anonimo;

        var savePatient = (cb, patient) => {
            if (patient) {
                if (patient.id) {
                    return async.setImmediate(() => cb(null, patient.id));
                } else {
                    Patient.create(patient).exec((err, data) => {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null, data.id);
                        }
                    });
                }
            } else {
                return async.setImmediate(() => cb(null, undefined));
            }
        };

        var getTupleForm = (cb, data) => {
            var damageType = data.damageType, eventType = data.eventType;
            TupleForm
                .findOne({ damageType: damageType, eventType: eventType, deleted: false })
                .exec((err, data) => {
                    if (err || !(data && (data || {}).associatedProcess)) {
                        cb(err || new Error('No existe relación con algún formulario'));
                    } else {
                        cb(null, data);
                    }
                });
        };

        var sendEstablishmentSupervisors = (eventData) => {
            Establishment
                .findOne(eventData.establishment)
                .populate('adverseEventSupervisors', { id: { '!': req.session.employee.id } })
                .then(establishment => {
                    var notifications = [];
                    var mails = [];
                    establishment.adverseEventSupervisors.forEach((employee) => {
                        notifications.push({
                            title: '<span><b>' + req.session.employee.fullname + '</b> envió un nuevo evento, ocurrido en <b>' + eventData.occurrenceService.name + '</b></span>',
                            modelModule: 'adverseEvent',
                            idModelModule: eventData.id,
                            type: 'New-Event-Adverse',
                            assignedTo: employee.id
                        });
                        if (eventData.damageType.categoryDamage === 'Evento centinela') {
                            mails.push({
                                employee: employee,
                                adverseEventId: eventData.id,
                                title: 'Nueva notificación de evento centinela',
                                description: '<span><b>' + req.session.employee.fullname + '</b> envió un nuevo evento centinela, ocurrido en <b>' + eventData.occurrenceService.name + '.</b></span>',
                                type: 'default',
                                adverseEvent: eventData,
                                sender: 'Módulo eventos adversos - Mi SSVQ',
                            });
                        }
                    });
                    NotificationService.sendNotifications(notifications);
                    mails.length > 0 ? EmailService.sendAdverseEventNotification(mails) : null;
                })
                .catch(err => sails.log(err));
        };

        var sendUnitSupervisors = (eventData) => {
            Unit
                .findOne(eventData.occurrenceService.id)
                .populate('adverseEventSupervisors', { id: { '!': req.session.employee.id } })
                .then(unit => {
                    var notifications = [];
                    var mails = [];
                    var name = anonimo ? 'Usuario anónimo' : req.session.employee.fullname;
                    unit.adverseEventSupervisors.forEach((employee) => {
                        notifications.push({
                            title: '<span><b>' + name + '</b> envió un nuevo evento, ocurrido en <b>' + eventData.occurrenceService.name + '</b></span>',
                            modelModule: 'adverseEvent',
                            idModelModule: eventData.id,
                            type: 'New-Event-Adverse',
                            assignedTo: employee.id
                        });
                        if (eventData.damageType.categoryDamage === 'Evento centinela') {
                            mails.push({
                                employee: employee,
                                adverseEventId: eventData.id,
                                title: 'Nueva notificación de evento centinela',
                                description: '<span><b>' + name + '</b> envió un nuevo evento centinela, ocurrido en <b>' + eventData.occurrenceService.name + '.</b></span>',
                                type: 'default',
                                adverseEvent: eventData,
                                sender: 'Módulo eventos adversos - Mi SSVQ',
                            });
                        }
                    });
                    NotificationService.sendNotifications(notifications);
                    mails.length > 0 ? EmailService.sendAdverseEventNotification(mails) : null;
                })
                .catch(err => sails.log(err));
        };

        var createLog = (adverseEvent, formData) => {
            AdverseEventLog
                .create({
                    adverseEvent: adverseEvent.id,
                    createdBy: anonimo ? undefined : req.session.employee.id,
                    type: 'eventCreate',
                    data: JSON.stringify({ adverseEvent: adverseEvent, formData: formData })
                })
                .exec(() => { });
        };

        async.parallel({
            patient: cb => savePatient(cb, eventData.patient),
            tupleForm: cb => getTupleForm(cb, eventData)
        }, (err, results) => {
            if (err) {
                return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
            } else {
                Object.assign(eventData, {
                    patient: results.patient, establishment: req.session.employee.establishment,
                    associatedProcess: results.tupleForm.associatedProcess, formType: results.tupleForm.nameForm,
                    createdBy: anonimo ? undefined : req.session.employee.id, status: 1
                });
                if (eventData.formType === 'FormUpp') {
                    (formData.causes || []).map(cause => cause.patient = eventData.patient);
                }
                AdverseEvent.create(eventData).exec((err, eventSaved) => {
                    if (err) {
                        return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
                    } else {
                        formData.adverseEvent = eventSaved.id;
                        // Se guarda datos del formulario
                        AdverseEventService
                            .saveForm(formData, eventData.formType)
                            .then(formSaved => {
                                // Se generan registros de posible duplicados en caso de existir
                                AdverseEventService.findAndCreateDuplicates(eventSaved);
                                eventSaved.formId = formSaved.id;
                                eventSaved.save(err => {
                                    if (err) {
                                        sails.log(err);
                                        return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
                                    } else {
                                        // Aca notificaciones
                                        AdverseEvent
                                            .findOne(eventSaved.id)
                                            .populate('occurrenceService')
                                            .populate('damageType')
                                            .then(eventData => {
                                                sendEstablishmentSupervisors(eventData);
                                                if ((eventData.occurrenceService || {}).id) sendUnitSupervisors(eventData);
                                                createLog(eventSaved, formSaved);
                                            })
                                            .catch(err => sails.log(err));
                                        return res.send({ ok: true, msg: 'ADVERSEEVENT.SUCCESS.CREATE', obj: eventSaved });
                                    }
                                });
                            })
                            .catch(err => {
                                AdverseEvent.update(eventSaved.id, { deleted: true })
                                    .then(() => { })
                                    .catch(err => sails.log(err));
                                sails.log(err);
                                return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
                            });
                    }
                });
            }
        });
    },
    updateEvent: (req, res) => {
        if (!req.body.eventForm ||
            !(req.body.eventForm || {}).eventData ||
            !((req.body.eventForm || {}).eventData || {}).id ||
            !(req.body.eventForm || {}).formData) {
            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.SAVE' });
        }
        var eventData = req.body.eventForm.eventData;
        var formData = req.body.eventForm.formData;

        var createLog = (adverseEvent, formData) => {
            AdverseEventLog
                .create({
                    adverseEvent: adverseEvent.id,
                    createdBy: req.session.employee.id,
                    type: 'eventUpdate',
                    data: JSON.stringify({ adverseEvent: adverseEvent, formData: formData })
                })
                .exec(() => { });
        };

        var savePatient = (cb, patient) => {
            if (patient) {
                if (patient.id) {
                    return async.setImmediate(() => cb(null, patient.id));
                } else {
                    Patient.create(patient).exec((err, data) => {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null, data.id);
                        }
                    });
                }
            } else {
                return async.setImmediate(() => cb(null, undefined));
            }
        };

        var getTupleForm = (cb, data) => {
            var damageType = data.damageType, eventType = data.eventType;
            TupleForm
                .findOne({ damageType: damageType, eventType: eventType })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        AdverseEventService
            .isFinalizedStatus(eventData.status)
            .then(isFinalized => {
                if (isFinalized) {
                    return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.FINALIZEDSTATUS' });
                } else {
                    async.parallel({
                        patient: cb => savePatient(cb, eventData.patient),
                        tupleForm: cb => getTupleForm(cb, eventData)
                    }, (err, results) => {
                        if (err) {
                            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
                        } else {
                            eventData.patient = results.patient;
                            //eventData.establishment = req.session.employee.establishment;

                            if (eventData.formType !== results.tupleForm.nameForm) {
                                eventData.associatedProcess = results.tupleForm.associatedProcess;
                                eventData.formType = results.tupleForm.nameForm;
                                delete formData.id;
                            }

                            AdverseEvent.update(eventData.id, eventData).exec((err, eventSaved) => {
                                if (err) {
                                    return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
                                } else {
                                    eventSaved = eventSaved[0];
                                    formData.adverseEvent = eventSaved.id;
                                    AdverseEventService
                                        .saveForm(formData, eventData.formType)
                                        .then(formSaved => {
                                            // Se limpian antiguos registros de posibles duplicados
                                            DuplicatedEvent.update(
                                                { or: [{ origin: eventSaved.id }, { duplicated: eventSaved.id }], verified: false },
                                                { verified: true }
                                            ).then((result, err) => {
                                                if (err) sails.log(err);
                                                else AdverseEventService.findAndCreateDuplicates(eventSaved);
                                            });
                                            // Se generan registros de posible duplicados en caso de existir
                                            eventSaved.formId = formSaved.id;
                                            eventSaved.save(err => {
                                                if (err) {
                                                    sails.log(err);
                                                    return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
                                                } else {
                                                    createLog(eventSaved, formSaved);
                                                    return res.send({ ok: true, msg: 'ADVERSEEVENT.SUCCESS.UPDATE', obj: eventSaved });
                                                }
                                            });
                                        })
                                        .catch(err => {
                                            sails.log(err);
                                            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.UPDATE', obj: err });
                                        });
                                }
                            });
                        }
                    });
                }
            })
            .catch(err => { return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.FINALIZEDSTATUS', obj: err }); });
    },
    getSent: (req, res) => {
        var async = require('async');
        var _ = require('lodash');
        var page = req.body.page || 1;
        /**
         * Filter
            patient: integer,
            eventType: integer,
            occurrenceService: integer,
            damageType: integer,
            minDate: date,
            maxDate: date
         */
        var filter = req.body.filter || {};

        AdverseEventStatus.find({
            deleted: false,
            finished: filter.finished
        }).exec((err, statusFound) => {
            var status = statusFound.length > 0 ? _.map(statusFound, 'id') : [];
            if (filter.finished === true) {
                if (filter.rejected) status = _.intersection(status, AdverseEventService.getRejectedStatus());
                else status = status = _.difference(status, AdverseEventService.getRejectedStatus());
            }
            var dynamicQuery = {
                deleted: false,
                status: status,
                createdBy: req.session.employee.id
            };
            // Filtro de paciente
            filter.patient && filter.patient.id ? dynamicQuery.patient = filter.patient.id : null;
            // Filtro de tipo de evento
            filter.eventType && filter.eventType.id ? dynamicQuery.eventType = filter.eventType.id : null;
            // Filtro de servicio de ocurrencia
            filter.occurrenceService && filter.occurrenceService.id ? dynamicQuery.occurrenceService = filter.occurrenceService.id : null;
            // Filtro de clasificación del daño
            filter.damageType ? dynamicQuery.damageType = filter.damageType : null;
            // Filtro fecha mínima de ocurrencia
            if (filter.minDate) {
                var minDate = new Date(filter.minDate);
                minDate.setHours(0, 0, 0, 0);
                _.merge(dynamicQuery, {
                    occurrenceAt: {
                        '>=': minDate
                    }
                });
            }
            // Filtro fecha máxima de ocurrencia
            if (filter.maxDate) {
                var maxDate = new Date(filter.maxDate);
                maxDate.setHours(23, 59, 59, 0);
                _.merge(dynamicQuery, {
                    occurrenceAt: {
                        '<=': maxDate
                    }
                });
            }

            async.parallel({
                count: (cb) => {
                    AdverseEvent
                        .count(dynamicQuery)
                        .exec(cb);
                },
                data: (cb) => {
                    AdverseEvent
                        .find({
                            where: dynamicQuery,
                            sort: {
                                updatedAt: 0,
                                id: 1
                            }
                        })
                        .paginate({ page: page || 1, limit: 15 })
                        .populate('status')
                        .populate('createdBy')
                        .populate('damageType')
                        .populate('eventType')
                        .populate('patient')
                        .populate('occurrenceService')
                        .exec((err, data) => {
                            if (err) {
                                cb(err, null);
                            } else {
                                cb(null, data);
                            }
                        });
                }
            }, (err, results) => {
                if (err) {
                    sails.log(err);
                    return res.send({ ok: false, obj: err });
                } else {
                    async.eachOfLimit(results.data, 10, (eventData, count, cb) => {
                        AdverseEventService
                            .getFormData(eventData.formId, eventData.formType)
                            .then(form => {
                                eventData.formData = form;
                                cb();
                            })
                            .catch(err => {
                                sails.log('error: ' + err + ' adverseEvent: ' + eventData.id);
                                eventData.remove = true;
                                cb();
                            });
                    }, err => {
                        if (err) {
                            return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
                        }
                        _.remove(results.data, { remove: true });
                        return res.send({
                            ok: true,
                            msg: 'EVENT.SEARCH.FOUND',
                            obj: { events: results.data || [], count: results.count }
                        });
                    });
                }
            });
        });
    },
    getAllDamageType: (req, res) => {
        DamageType
            .find({ deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'DAMAGETYPE.SEARCH.ERROR',
                        obj: { err: err }
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'DAMAGETYPE.SEARCH.FOUND',
                        obj: { damageTypes: data }
                    });
                }
            });
    },
    getUnitsEvents: (req, res) => {
        var establishment = req.body.establishment ? req.body.establishment : req.session.employee.establishment;
        Unit
            .find({
                establishment: establishment,
                deleted: false,
                adverseEvent: [true, false]
            })
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'UNITSEVENT.SEARCH.ERROR',
                        obj: { err: err }
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'UNITSEVENT.SEARCH.FOUND',
                        obj: { units: data }
                    });
                }
            });
    },
    getAllEventType: (req, res) => {
        AdverseEventType
            .find({ deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'ADVERSEEVENTTYPE.SEARCH.ERROR',
                        obj: { err: err }
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'ADVERSEEVENTTYPE.SEARCH.FOUND',
                        obj: { eventTypes: data }
                    });
                }
            });
    },
    getAllTupleForm: (req, res) => {
        TupleForm
            .find({ deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'TUPLEFORM.SEARCH.ERROR',
                        obj: { err: err }
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'TUPLEFORM.SEARCH.FOUND',
                        obj: { tupleForms: data }
                    });
                }
            });
    },
    getAllAssociatedProcess: (req, res) => {
        AssociatedProcess
            .find({ deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'ASSOCIATEDPROCESS.SEARCH.ERROR',
                        obj: { err: err }
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'ASSOCIATEDPROCESS.SEARCH.FOUND',
                        obj: { associatedProcesses: data }
                    });
                }
            });
    },
    getAllParametricsFallForm: (req, res) => {

        var getAllPlacesFall = cb => {
            PlaceFall
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllFromFalls = cb => {
            FromFall
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllActivitiesFall = cb => {
            ActivityFall
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllEventConsequences = cb => {
            EventConsequence
                .find({
                    deleted: false,
                    fixedField: true,
                    visibleFall: true
                })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllPreventiveMeasures = cb => {
            PreventiveMeasure
                .find({
                    deleted: false,
                    fixedField: true,
                    visibleFall: true
                })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllRiskCategorizations = cb => {
            RiskCategorization
                .find({ scale: 'downton', deleted: false })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllPreviousFalls = cb => {
            PreviousFall
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllConsciousnessStates = cb => {
            ConsciousnessState
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllTypesMedication = cb => {
            TypeMedication
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllSensoryDeficits = cb => {
            SensoryDeficit
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllPatientMovilities = cb => {
            PatientMovility
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllPatientWalks = cb => {
            PatientWalk
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        async.parallel({
            placesFall: getAllPlacesFall,
            fromFalls: getAllFromFalls,
            activitiesFall: getAllActivitiesFall,
            eventConsequences: getAllEventConsequences,
            preventiveMeasures: getAllPreventiveMeasures,
            riskCategorizations: getAllRiskCategorizations,
            previousFalls: getAllPreviousFalls,
            consciousnessStates: getAllConsciousnessStates,
            typesMedication: getAllTypesMedication,
            sensoryDeficits: getAllSensoryDeficits,
            patientMovilities: getAllPatientMovilities,
            patientWalks: getAllPatientWalks
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
            } else {
                return res.send({ ok: true, msg: 'ADVERSEEVENT.SEARCH.SUCCESS', obj: results });
            }
        });
    },
    getDetails: (req, res) => {
        if (!req.body.id) {
            return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: {} });
        }
        AdverseEvent
            .findOne({
                id: req.body.id,
                deleted: false,
            })
            .populate('patient')
            .populate('createdBy')
            .populate('damageType')
            .populate('eventType')
            .populate('associatedProcess')
            .populate('occurrenceService')
            .populate('originOccurrence')
            .populate('reportService')
            .populate('establishment')
            .exec((err, event) => {
                if (err) {
                    sails.log(err);
                    return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
                } else {
                    if (!((event || {}).formId || (event || {}).formType) && (event || {}).formType !== 'FormGeneral') {
                        return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: {} });
                    }
                    AdverseEvent.subscribe(req, [req.body.id]);
                    AdverseEventService
                        .validatePrivileges(req.session.employee.id, event.id)
                        .then(result => {
                            if (!result.ok) {
                                return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.DENIED', obj: {} });
                            }
                            AdverseEventService
                                .getFormData(event.formId, event.formType)
                                .then(form => {
                                    if (event.patient) {
                                        if (event.patient.birthdate) {
                                            let moment = require('moment');
                                            event.patient.years = moment().diff(event.patient.birthdate, 'years');
                                            event.patient.months = moment().diff(event.patient.birthdate, 'months') - (12 * event.patient.years);
                                            var estimatedDaysAux = moment(event.patient.birthdate).add(event.patient.years, 'year').add(event.patient.months, 'month');
                                            event.patient.days = Math.floor(moment.duration(moment().diff(estimatedDaysAux)).asDays());
                                        } else {
                                            event.patient.years = (event.patient.estimatedYears) ? event.patient.estimatedYears : null;
                                            event.patient.months = (event.patient.estimatedMonths) ? event.patient.estimatedMonths : null;
                                            event.patient.days = (event.patient.estimatedDays) ? event.patient.estimatedDays : null;
                                        }
                                    }
                                    return res.send({
                                        ok: true,
                                        msg: 'ADVERSEEVENT.SEARCH.SUCCESS',
                                        obj: {
                                            eventData: event,
                                            formData: form,
                                            privileges: result.obj
                                        }
                                    });
                                })
                                .catch(err => {
                                    return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
                                });
                        })
                        .catch(err => {
                            return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
                        });
                }
            });
    },
    getStatus: (req, res) => {
        AdverseEventStatus
            .find({ deleted: false })
            .exec((err, status) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'ADVERSEEVENTSTATUS.SEARCH.ERROR',
                        obj: err
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'ADVERSEEVENTSTATUS.SEARCH.FOUND',
                        obj: { status: status }
                    });
                }
            });
    },
    saveStatus: (req, res) => {
        if (!req.body.id || !req.body.status) {
            return res.send({ ok: false, msg: 'ADVERSEEVENTSTATUS.SAVE.ERROR', obj: {} });
        }

        AdverseEventService
            .validatePrivileges(req.session.employee.id, req.body.id)
            .then(result => {
                if (result.ok && result.obj.supEstablishment) {
                    AdverseEvent
                        .update(req.body.id, { status: req.body.status })
                        .exec((err, event) => {
                            if (err) {
                                return res.send({ ok: false, msg: 'ADVERSEEVENTSTATUS.SAVE.ERROR', obj: {} });
                            } else {
                                // Se limpian registros de posibles duplicados o se busca nuevos posibles duplicados (estado inicial == 1)
                                event[0].status === 1 ? AdverseEventService.findAndCreateDuplicates(event[0]) : AdverseEventService.cleanDuplicates(event[0]);
                                AdverseEvent
                                    .findOne(event[0].id)
                                    .populate('status')
                                    .then(eventData => AdverseEventService.sendStatusLogAndNotifications(eventData, req.session.employee))
                                    .catch(err => sails.log(err));
                                return res.send({ ok: true, msg: 'ADVERSEEVENTSTATUS.SAVE.SUCCESS', obj: event });
                            }
                        });
                } else {
                    return res.send({ ok: false, msg: 'ADVERSEEVENTSTATUS.SAVE.ERROR' });
                }
            })
            .catch(err => { return res.send({ ok: false, msg: 'ADVERSEEVENTSTATUS.SAVE.ERROR' }); });
    },
    getParametricsAutocomplete: (req, res) => {
        /**
         * Filtro de búsqueda
         */
        var filterText = (req.body.filter || '').replace(/[\.\-]/g, '');
        filterText = '%' + filterText.replace(/\s+/g, '%') + '%';
        var filter = {
            name: { 'like': filterText || '' },
            fixedField: false,
            deleted: false
        };

        AdverseEventService
            .getParametricsForm(filter, req.body.parametric)
            .then(result => {
                return res.send({ ok: true, obj: { parametrics: result }, msg: 'ADVERSEEVENT.SEARCH.FOUND' });
            })
            .catch(err => {
                return res.send({ ok: false, obj: err, msg: 'ADVERSEEVENT.SEARCH.ERROR' });
            });
    },
    getEventsPatient: (req, res) => {
        if (!req.body.id) {
            return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: {} });
        }
        var moment = require('moment');
        var async = require('async');
        var dateFilter = moment().subtract(30, 'days').toDate();
        dateFilter.setHours(0, 0, 0, 0);

        Employee.findOne(req.session.employee.id)
            .populate('adverseEventEstablishmentSupervised')
            .populate('adverseEventUnitSupervised')
            .exec((err, employee) => {
                if (err) {
                    return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: {} });
                } else {
                    var filter = {
                        patient: req.body.id,
                        deleted: false,
                        createdAt: { '>': dateFilter },
                        or: []
                    };
                    filter.or.push({ createdBy: req.session.employee.id});
                    if (employee.adverseEventEstablishmentSupervised.length > 0) {
                        filter.or.push({ establishment: _.map(employee.adverseEventEstablishmentSupervised, 'id') });
                    }
                    if (employee.adverseEventUnitSupervised.length > 0) {
                        filter.or.push({ occurrenceService: _.map(employee.adverseEventUnitSupervised, 'id') });
                    }
                    if (filter.or.length > 0) {
                        AdverseEvent
                            .find(filter)
                            .populate('status')
                            .populate('createdBy')
                            .populate('damageType')
                            .populate('eventType')
                            .populate('patient')
                            .populate('occurrenceService')
                            .exec((err, data) => {
                                if (err) {
                                    return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: {} });
                                } else {
                                    async.eachOfLimit(data, 10, (eventData, count, cb) => {
                                        AdverseEventService
                                            .getFormData(eventData.formId, eventData.formType)
                                            .then(form => {
                                                eventData.formData = form;
                                                cb();
                                            }, err => {
                                                sails.log('error: ' + err + ' adverseEvent: ' + eventData.id);
                                                eventData.remove = true;
                                                cb();
                                            });
                                    }, err => {
                                        if (err) {
                                            return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
                                        }
                                        _.remove(data, { remove: true });
                                        return res.send({
                                            ok: true,
                                            msg: 'ADVERSEEVENT.SEARCH.SUCCESS',
                                            obj: data
                                        });
                                    });
                                }
                            });
                    } else {
                        return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: {} });
                    }
                }
            });
    },
    getValidEstablishment: (req, res) => {
        if (!req.session.employee.establishment) {
            return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: { valid: false } });
        }

        Establishment
            .find({
                id: req.session.employee.establishment,
                adverseEventModuleAvailable: true,
                deleted: false
            })
            .exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: { valid: false } });
                } else {
                    if (data.length > 0) {
                        return res.send({ ok: true, msg: 'ADVERSEEVENT.SEARCH.SUCCESS', obj: { valid: true } });
                    } else {
                        return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: { valid: false } });
                    }
                }
            });
    },
    getSupervised: (req, res) => {
        var async = require('async');
        var _ = require('lodash');
        var page = req.body.page || 1;
        /**
         * Filter
            patient: integer,
            eventType: integer,
            occurrenceService: integer,
            damageType: integer,
            minDate: date,
            maxDate: date
         */
        var filter = req.body.filter || {};
        var getAdverseEventStatus = cb => {
            AdverseEventStatus
                .find({
                    deleted: false,
                    finished: filter.finished
                })
                .exec(function (err, status) {
                    if (status.length > 0) {
                        status = _.map(status, 'id');
                        if (filter.finished === true) {
                            if (filter.rejected) status = _.intersection(status, AdverseEventService.getRejectedStatus());
                            else status = status = _.difference(status, AdverseEventService.getRejectedStatus());
                        }
                        cb(null, status);
                    } else {
                        cb(null, []);
                    }
                });
        };

        var getSupervised = cb => {
            AdverseEventService
                .getSupervised(req.session.employee.id, filter)
                .then(supervised => cb(null, supervised))
                .catch(err => cb(err));
        };

        async.parallel({
            status: getAdverseEventStatus,
            supervised: getSupervised
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, msg: '', obj: '' });
            } else {
                var dynamicQuery = {
                    deleted: false,
                    status: results.status,
                    patientDiagnostic: { 'contains': filter.searchText || '' },
                    or: [
                        { establishment: results.supervised.establishments },
                        { occurrenceService: results.supervised.units }
                    ]
                };
                // Filtro de paciente
                filter.patient && filter.patient.id ? dynamicQuery.patient = filter.patient.id : null;
                // Filtro de tipo de evento
                filter.eventType && filter.eventType.id ? dynamicQuery.eventType = filter.eventType.id : null;
                // Filtro de servicio de ocurrencia
                filter.occurrenceService && filter.occurrenceService.id ? dynamicQuery.occurrenceService = filter.occurrenceService.id : null;
                // Filtro de clasificación del daño
                filter.damageType ? dynamicQuery.damageType = filter.damageType : null;
                // Filtro fecha mínima
                if (filter.minDate) {
                    var minDate = new Date(filter.minDate);
                    minDate.setHours(0, 0, 0, 0);
                    _.merge(dynamicQuery, {
                        occurrenceAt: {
                            '>=': minDate
                        }
                    });
                }
                // Filtro fecha máxima
                if (filter.maxDate) {
                    var maxDate = new Date(filter.maxDate);
                    maxDate.setHours(23, 59, 59, 0);
                    _.merge(dynamicQuery, {
                        occurrenceAt: {
                            '<=': maxDate
                        }
                    });
                }

                async.parallel({
                    count: (cb) => {
                        AdverseEvent
                            .count(dynamicQuery)
                            .exec(cb);
                    },
                    data: (cb) => {
                        AdverseEvent
                            .find({
                                where: dynamicQuery,
                                sort: {
                                    updatedAt: 0,
                                    id: 1
                                }
                            })
                            .paginate({ page: page || 1, limit: 15 })
                            .populate('status')
                            .populate('createdBy')
                            .populate('damageType')
                            .populate('eventType')
                            .populate('patient')
                            .populate('occurrenceService')
                            .exec((err, data) => {
                                if (err) {
                                    cb(err, null);
                                } else {
                                    cb(null, data);
                                }
                            });
                    }
                }, (err, results) => {
                    if (err) {
                        sails.log(err);
                        return res.send({ ok: false, obj: err });
                    } else {
                        async.eachOfLimit(results.data, 10, (eventData, count, cb) => {
                            AdverseEventService
                                .getFormData(eventData.formId, eventData.formType)
                                .then(form => {
                                    eventData.formData = form;
                                    cb();
                                })
                                .catch(err => {
                                    sails.log('error: ' + err + ' adverseEvent: ' + eventData.id);
                                    eventData.remove = true;
                                    cb();
                                });
                        }, err => {
                            if (err) {
                                return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
                            }
                            _.remove(results.data, { remove: true });
                            return res.send({
                                ok: true,
                                msg: 'EVENT.SEARCH.FOUND',
                                obj: { events: results.data || [], count: results.count }
                            });
                        });
                    }
                });
            }
        });
    },
    getAllParametricsMedicationForm: (req, res) => {

        var getAllEventConsequences = cb => {
            EventConsequence
                .find({
                    deleted: false,
                    fixedField: true,
                    visibleMedication: true
                })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllMedicineVias = cb => {
            MedicineVia
                .find({ deleted: false })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllStageErrors = cb => {
            StageError
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllMedicationTypeErrors = cb => {
            MedicationTypeError
                .find({ deleted: false, fixedField: true })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        async.parallel({
            eventConsequences: getAllEventConsequences,
            medicineVias: getAllMedicineVias,
            stageErrors: getAllStageErrors,
            medicationTypeErrors: getAllMedicationTypeErrors
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
            } else {
                return res.send({ ok: true, msg: 'ADVERSEEVENT.SEARCH.SUCCESS', obj: results });
            }
        });
    },
    getAllParametricsUppForm: (req, res) => {

        var getAllGradesUpp = cb => {
            GradeUpp
                .find({ deleted: false })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllLocalizationsUpp = cb => {
            LocalizationUpp
                .find({
                    deleted: false,
                    fixedField: true
                })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllTracingsUpp = cb => {
            TracingUpp
                .find({ deleted: false })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllDependenceRisks = cb => {
            DependenceRisk
                .find({ deleted: false })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllPreventiveMeasures = cb => {
            PreventiveMeasure
                .find({
                    deleted: false,
                    fixedField: true,
                    visibleUpp: true
                })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        var getAllRiskCategorizations = cb => {
            RiskCategorization
                .find({ scale: 'braden', deleted: false })
                .exec((err, data) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, data);
                    }
                });
        };

        async.parallel({
            gradesUpp: getAllGradesUpp,
            localizationsUpp: getAllLocalizationsUpp,
            tracingsUpp: getAllTracingsUpp,
            dependenceRisks: getAllDependenceRisks,
            preventiveMeasures: getAllPreventiveMeasures,
            riskCategorizations: getAllRiskCategorizations
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err });
            } else {
                return res.send({ ok: true, msg: 'ADVERSEEVENT.SEARCH.SUCCESS', obj: results });
            }
        });
    },
    getDuplicatedEvents: (req, res) => {
        var _ = require('lodash');
        var async = require('async');
        var filter = { verified: false };
        // Si se envia campo origen significa que buscará los posible duplicados de ese evento origen
        // En caso de no venir buscará todos los eventos posible% duplicados
        req.body.origin ? filter.origin = req.body.origin : null;
        // Quito el estado Validado cuando se busca los posible duplicados de un evento
        var statusFilter = req.body.origin ? [1] : [1, 2];

        const getAdverseEvent = adverseEvent => new Promise((res, rej) => {
            AdverseEvent
                .findOne({ id: adverseEvent, status: statusFilter })
                .populate('status')
                .populate('createdBy')
                .populate('damageType')
                .populate('eventType')
                .populate('patient')
                .populate('occurrenceService')
                .exec((err, data) => {
                    if (err) return rej(err);
                    if (data) {
                        AdverseEventService
                            .getFormData(data.formId, data.formType)
                            .then(formData => {
                                data.formData = formData;
                                res(data);
                            }, err => rej(err + ', evento #' + adverseEvent))
                    } else rej('No existe data o evento cambio de estado, evento #' + adverseEvent);
                });
        });

        AdverseEventService
            .getSupervised(req.session.employee.id)
            .then(supervised => {
                filter.establishment = (supervised || {}).establishments;
                DuplicatedEvent
                    .find(filter)
                    .populate('duplicated')
                    .sort('createdAt ASC')
                    .exec((err, data) => {
                        if (err) { return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err }); }
                        async.map(data, (register, callback) => {
                            // Caso de evento mal registrado
                            if (!register.duplicated) return async.setImmediate(() => callback());
                            if (register.duplicated.formType !== 'FormGeneral' && !register.duplicated.formId) {
                                return async.setImmediate(() => callback());
                            }
                            // Si viene campo origen busco entonces los datos del duplicado, si no los de origen
                            let event = filter.origin ? register.duplicated.id : register.origin;
                            getAdverseEvent(event)
                                .then(result => {
                                    if (filter.origin) register.duplicated = result;
                                    else register.origin = result;
                                    callback(null, register);
                                }, err => {
                                    sails.log('Ha ocurrido un error: ' + err);
                                    callback();
                                });
                        }, (err, result) => {
                            if (err) {
                                return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err })
                            } else {
                                _.remove(result, _.isUndefined)
                                return res.send({ ok: true, msg: 'ADVERSEEVENT.SEARCH.SUCCESS', obj: result })
                            }
                        });
                    });
            })
            .catch(err => {
                return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: err })
            });
    },
    markDuplicateEvent: (req, res) => {
        if (!req.body.idRegister || !req.body.idEvent) {
            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.UPDATE' });
        }
        var idRegister = req.body.idRegister;
        var idEvent = req.body.idEvent;
        var cleanOrigin = (cb, eventId) => {
            DuplicatedEvent.update(
                { origin: eventId, verified: false },
                {
                    isDuplicated: false,
                    verified: true
                }
            ).then(() => cb(null, { ok: true })).catch(err => cb(err));
        };
        var cleanDuplicates = (cb, eventId) => {
            DuplicatedEvent.update(
                { duplicated: eventId, verified: false },
                {
                    isDuplicated: false,
                    verified: true
                }
            ).then(() => cb(null, { ok: true })).catch(err => cb(err));
        };
        var setDuplicateEvent = (cb, duplicateEvent, originalEventId) => {
            AdverseEvent.update(duplicateEvent,
                {
                    originalEvent: originalEventId,
                    status: 4 // Duplicado
                }
            ).then(() => {
                AdverseEvent.findOne(duplicateEvent).populate('status')
                    .then(data => AdverseEventService.sendStatusLogAndNotifications(data, req.session.employee));
                cb(null, { ok: true })
            }).catch(err => cb(err));
        };

        AdverseEventService
            .validatePrivileges(req.session.employee.id, idEvent)
            .then(result => {
                if (result.ok && result.obj.supEstablishment) {
                    DuplicatedEvent
                        .update(idRegister, { verified: true, isDuplicated: true })
                        .then(result => {
                            async.parallel([
                                cb => cleanDuplicates(cb, result[0].duplicated),
                                cb => cleanOrigin(cb, result[0].duplicated),
                                cb => setDuplicateEvent(cb, result[0].duplicated, result[0].origin)
                            ], (err, result) => {
                                if (result[0].ok) {
                                    return res.send({ ok: true, msg: 'ADVERSEEVENT.SUCCESS.UPDATE', obj: [] });
                                } else {
                                    return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.UPDATE', obj: err });
                                }
                            });
                        })
                        .catch(err => {
                            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.UPDATE', obj: err });
                        });
                } else {
                    return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.PERMISSION', obj: {} });
                }
            })
            .catch(err => {
                return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.UPDATE', obj: err });
            });
    },
    markNotDuplicateEvent: (req, res) => {
        if (!req.body.idRegister || !req.body.idEvent) {
            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.UPDATE' });
        }
        var idRegister = req.body.idRegister;
        var idEvent = req.body.idEvent;

        AdverseEventService
            .validatePrivileges(req.session.employee.id, idEvent)
            .then(result => {
                if (result.ok && result.obj.supEstablishment) {
                    DuplicatedEvent
                        .update(idRegister, { verified: true, isDuplicated: false })
                        .then(() => {
                            return res.send({ ok: true, msg: 'ADVERSEEVENT.SUCCESS.UPDATE', obj: [] });
                        })
                        .catch(err => {
                            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.UPDATE', obj: err });
                        });
                } else {
                    return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.PERMISSION', obj: {} });
                }
            })
            .catch(err => {
                return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.UPDATE', obj: err });
            });


    },
    getEventType: (req, res) => {
        var filter = {
            deleted: false,
            name: { 'contains': req.body.filter || '' }
        };

        async.parallel({
            count: (cb) => {
                AdverseEventType
                    .count(filter)
                    .exec(cb);
            },
            data: (cb) => {
                AdverseEventType
                    .find(filter)
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || 10 })
                    .exec((err, eventTypes) => {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, eventTypes);
                        }
                    });
            }
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: err });
            } else {
                return res.send({ ok: true, obj: { eventTypes: results.data, found: results.count } });
            }
        });
    },
    unsubscribe: (req, res) => {
        AdverseEvent.unsubscribe(req, req.body.id);
    },
    getUppsPatient: (req, res) => {
        if (!req.body.patient) {
            return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.UNDEFINEDPATIENT', obj: {} });
        }

        CauseUpp
            .find({
                patient: req.body.patient,
                deleted: false
            })
            .populate('grade')
            .populate('origin')
            .populate('localization')
            .exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: [] });
                } else {
                    if (data.length > 0) {
                        return res.send({ ok: true, msg: 'ADVERSEEVENT.SEARCH.SUCCESS', obj: data });
                    } else {
                        return res.send({ ok: false, msg: 'ADVERSEEVENT.SEARCH.ERROR', obj: [] });
                    }
                }
            });
    },
    initMedicine: (req, res) => {
        if ((req.session.employee || {}).id !== -1) return res.send('Pillin pillin, no tienes acceso.');
        var xlsx = require('xlsx');
        var imports = sails.config.imports;
        var workbook = xlsx.readFile(imports.medicineService.filePath);
        var medicines = xlsx.utils.sheet_to_json(workbook.Sheets[imports.medicineService.excelSheet.medicines]);

        InitService
            .initMedicineService(medicines)
            .then(resp => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch(err => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    getOriginOccurrence: async (req, res) => {
        try {
            var originOccurrence = await OriginOccurrence.find({ deleted: false });
            return res.ok(originOccurrence);
        } catch (e) {
            sails.log(e);
            return res.negotiate(e);
        }
    }
};

