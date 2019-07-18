/* global sails */

// AdverseEventService.js - in api/services

'use strict';

var handlerParameter = (parameter, key) => {
    return new Promise((res, rej) => {
        if ((parameter || {}).other) {
            if ((parameter || {}).item) {
                return async.setImmediate(() => res(parameter.item.id));
            } else {
                AdverseEventService
                    .findOrCreateParametricsForm({ name: (parameter || {}).name }, key)
                    .then(result => {
                        res(result.id);
                    })
                    .catch(err => {
                        rej(err);
                    });
            }
        } else {
            return async.setImmediate(() => res(parameter));
        }
    });
}

var findInParameters = (parameters) => {
    return new Promise((resolve, reject) => {
        let async = require('async');
        async.mapValues(parameters, (parameter, key, callback) => {
            if ((parameter || []).length > 0 && !_.isString(parameter)) {
                async.map(parameter, (option, cb) => {
                    handlerParameter(option, key)
                        .then(result => {
                            cb(null, result);
                        })
                        .catch(err => cb(err));
                }, (err, result) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                })
            } else {
                handlerParameter(parameter, key)
                    .then(result => {
                        callback(null, result);
                    })
                    .catch(err => callback(err));
            }
        }, (err, result) => {
            if (err) {
                return reject(err);
            }
            result = _.mapValues(result, (item, key) => {
                if (_.isObject(item) && item.id) {
                    return item.id;
                } else {
                    return item;
                }
            });
            return resolve(result);
        });
    });
};

// Ids de estados de eventos rechazados
var duplicatedId = 4;
var rejectId = 3;
var validateId = 2;

module.exports = {
    saveForm: (data, form) => {
        return new Promise((resolve, reject) => {
            findInParameters(data)
                .then(result => {
                    switch (form) {
                        case 'FormFall':
                            if (result.id) {
                                FormFall.update(result.id, result)
                                    .then(formSaved => { return resolve(formSaved[0]); })
                                    .catch(err => { return reject(err); });
                            } else {
                                FormFall.create(result)
                                    .then(formSaved => { return resolve(formSaved); })
                                    .catch(err => { return reject(err); });
                            }
                            break;
                        case 'FormMedication':
                            if (result.id) {
                                FormMedication.update(result.id, result)
                                    .then(formSaved => { return resolve(formSaved[0]); })
                                    .catch(err => { return reject(err); });
                            } else {
                                FormMedication.create(result)
                                    .then(formSaved => { return resolve(formSaved); })
                                    .catch(err => { return reject(err); });
                            }
                            break;
                        case 'FormUpp':
                            let preventiveMeasures = result.preventiveMeasures;
                            if (result.id) {
                                result.preventiveMeasures = undefined;
                                FormUpp.update(result.id, result)
                                    .then(formSaved => {
                                        //Clean
                                        FormPreventiveMeasure.destroy({ formUpp: undefined }).exec(() => { });
                                        //Registro en tabla intermedia
                                        if ((preventiveMeasures || []).length > 0) {
                                            async.map(preventiveMeasures, (preventive, cb) => {
                                                FormPreventiveMeasure
                                                    .findOrCreate({ formUpp: formSaved[0].id, preventiveMeasure: preventive.id || preventive })
                                                    .then(data => {
                                                        if (preventive.value) {
                                                            data.value = preventive.value;
                                                            data.save(err => {
                                                                if (err) cb(err);
                                                                else cb();
                                                            });
                                                        } else {
                                                            cb();
                                                        }
                                                    })
                                                    .catch(err => cb(err));
                                            }, (err, result) => {
                                                if (err) return reject(err)
                                                else return resolve(formSaved[0]);
                                            });
                                        } else {
                                            return resolve(formSaved[0]);
                                        }
                                    })
                                    .catch(err => { return reject(err); });
                            } else {
                                FormUpp.create(result)
                                    .then(formSaved => {
                                        if ((preventiveMeasures || []).length > 0) {
                                            async.map(preventiveMeasures, (preventive, cb) => {
                                                FormPreventiveMeasure
                                                    .create({
                                                        formUpp: formSaved.id,
                                                        preventiveMeasure: (preventive || {}).id || preventive,
                                                        value: (preventive || {}).value
                                                    })
                                                    .then(data => cb())
                                                    .catch(err => cb(err));
                                            }, (err, result) => {
                                                if (err) return reject(err)
                                                else return resolve(formSaved);
                                            });
                                        } else {
                                            return resolve(formSaved);
                                        }
                                    })
                                    .catch(err => { return reject(err); });
                            }
                            break;
                        case 'FormGeneral':
                            return resolve({});
                        default:
                            return reject('No existe tipo de formulario.');
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    },
    getFormData: (id, form) => {
        return new Promise((resolve, reject) => {
            if (form === 'FormGeneral') async.setImmediate(() => { return resolve({}); });
            else if (!id) async.setImmediate(() => { return reject('Falta id de form'); });
            else {
                switch (form) {
                    case 'FormFall':
                        FormFall
                            .findOne(id)
                            .populate('activityFall')
                            .populate('fromFall')
                            .populate('placeFall')
                            .populate('typesInjury')
                            .populate('preventiveMeasures')
                            .populate('fallRisk')
                            .populate('previousFall')
                            .populate('consciousnessState')
                            .populate('typeMedicationUsed')
                            .populate('sensoryDeficit')
                            .populate('patientMovility')
                            .populate('patientWalk')
                            .then(response => resolve(response))
                            .catch(err => reject(err));
                        break;
                    case 'FormMedication':
                        FormMedication
                            .findOne(id)
                            .populate('medicine')
                            .populate('via')
                            .populate('consequences')
                            .populate('stageError')
                            .populate('typeError')
                            .then(response => resolve(response))
                            .catch(err => reject(err));
                        break;
                    case 'FormUpp':
                        FormUpp
                            .findOne(id)
                            .populate('causes')
                            .populate('dependenceRisk')
                            .populate('uppRisk')
                            .populate('preventiveMeasures')
                            .then(response => {
                                var getCauses = (cb, causes) => {
                                    if (causes.length > 0) {
                                        async.map(causes, (cause, callback) => {
                                            CauseUpp
                                                .findOne(cause.id)
                                                .populate('origin')
                                                .populate('localization')
                                                .populate('grade')
                                                .populate('tracingUpp')
                                                .then(causeResult => {
                                                    callback(null, causeResult);
                                                })
                                                .catch(err => {
                                                    callback(err);
                                                });
                                        }, (err, result) => {
                                            if (err) cb(err);
                                            cb(null, result);
                                        });
                                    } else {
                                        async.setImmediate(() => cb(null, []));
                                    }
                                };
                                var getPreventiveObservations = (cb, data) => {
                                    let preventiveWithObservation = _.filter(data.preventiveMeasures, { hasObservation: true });
                                    if (preventiveWithObservation.length > 0) {
                                        FormPreventiveMeasure.find({ formUpp: data.id, preventiveMeasure: _.map(data.preventiveMeasures, 'id') })
                                            .then(formsPreventive => {
                                                async.map(data.preventiveMeasures, (preventives, callback) => {
                                                    let value = (_.find(formsPreventive, { preventiveMeasure: preventives.id }) || {}).value;
                                                    if (value) {
                                                        preventives.value = value;
                                                    }
                                                    callback(null, preventives);
                                                }, (err, result) => {
                                                    if (err) cb(err);
                                                    cb(null, result);
                                                });
                                            })
                                            .catch(err => cb(err));
                                    } else {
                                        async.setImmediate(() => cb(null, data.preventiveMeasures));
                                    }
                                };

                                async.parallel({
                                    causes: cb => getCauses(cb, response.causes),
                                    preventiveMeasures: cb => getPreventiveObservations(cb, _.pick(response, ['id', 'preventiveMeasures']))
                                }, (err, result) => {
                                    if (err) { return reject(err) };
                                    response.causes = result.causes;
                                    response.preventiveMeasures = result.preventiveMeasures;
                                    resolve(response);
                                });
                            })
                            .catch(err => reject(err));
                        break;
                    case 'FormGeneral':
                        return resolve({});
                        break;
                    default:
                        async.setImmediate(() => { return reject('No existe tipo de formulario'); });
                }
            }
        });
    },
    getParametricsForm: (filter, parametric) => {
        return new Promise((resolve, reject) => {
            switch (parametric) {
                case 'placeFall':
                    PlaceFall.find(filter).paginate({ page: 1, limit: 10 })
                        .then(result => { return resolve(result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'fromFall':
                    FromFall.find(filter).paginate({ page: 1, limit: 10 })
                        .then(result => { return resolve(result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'activityFall':
                    ActivityFall.find(filter).paginate({ page: 1, limit: 10 })
                        .then(result => { return resolve(result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'typesInjury':
                case 'eventConsequence':
                    EventConsequence.find(filter).paginate({ page: 1, limit: 10 })
                        .then(result => { return resolve(result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'preventiveMeasure':
                case 'preventiveMeasures':
                    PreventiveMeasure.find(filter).paginate({ page: 1, limit: 10 })
                        .then(result => { return resolve(result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'fallRisk':
                case 'riskCategorization':
                    RiskCategorization.find(filter).paginate({ page: 1, limit: 10 })
                        .then(result => { return resolve(result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'typeError':
                case 'medicationTypeError':
                    MedicationTypeError.find(filter).paginate({ page: 1, limit: 10 })
                        .then(result => { return resolve(result); })
                        .catch(err => { return reject(err); });
                    break;
                default:
                    async.setImmediate(() => { return reject('No existe parametrica'); });
            }
        });
    },
    findOrCreateParametricsForm: (data, parametric) => {
        return new Promise((resolve, reject) => {
            switch (parametric) {
                case 'placeFall':
                    PlaceFall.findOrCreate(data)
                        .then(result => { return resolve(result[0] || result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'fromFall':
                    FromFall.findOrCreate(data)
                        .then(result => { return resolve(result[0] || result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'activityFall':
                    ActivityFall.findOrCreate(data)
                        .then(result => { return resolve(result[0] || result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'typesInjury':
                case 'consequences':
                case 'eventConsequence':
                    EventConsequence.findOrCreate(data)
                        .then(result => { return resolve(result[0] || result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'preventiveMeasure':
                case 'preventiveMeasures':
                    PreventiveMeasure.findOrCreate(data)
                        .then(result => { return resolve(result[0] || result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'fallRisk':
                case 'riskCategorization':
                    RiskCategorization.findOrCreate(data)
                        .then(result => { return resolve(result[0] || result); })
                        .catch(err => { return reject(err); });
                    break;
                case 'typeError':
                case 'medicationTypeError':
                    MedicationTypeError.findOrCreate(data)
                        .then(result => { return resolve(result[0] || result); })
                        .catch(err => { return reject(err); });
                    break;
                default:
                    async.setImmediate(() => { return reject('No existe parametrica'); });
            }
        });
    },
    validatePrivileges: (userId, eventId) => {
        return new Promise((resolve, reject) => {
            if (!userId && !eventData) {
                async.setImmediate(() => { return reject({ ok: false, msg: 'Faltan datos para validar privilegios' }) });
            }

            var getEmployee = (cb, userId) => {
                Employee.findOne(userId)
                    .populate('adverseEventEstablishmentSupervised')
                    .populate('adverseEventUnitSupervised')
                    .then(result => cb(null, result))
                    .catch(err => cb(err));
            }

            var getEvent = (cb, eventId) => {
                AdverseEvent.findOne(eventId)
                    .then(result => cb(null, result))
                    .catch(err => cb(err));
            }

            async.parallel({
                employee: cb => getEmployee(cb, userId),
                eventData: cb => getEvent(cb, eventId)
            }, (err, result) => {
                if (err) {
                    return resolve({ ok: false, msg: 'Error', obj: err });
                } else {
                    var employee = result.employee, eventData = result.eventData;
                    var supEstablishment = _.indexOf(_.map(employee.adverseEventEstablishmentSupervised, 'id'), eventData.establishment) < 0 ? false : true;
                    var supUnit = _.indexOf(_.map(employee.adverseEventUnitSupervised, 'id'), eventData.occurrenceService) < 0 ? false : true;
                    if (supEstablishment || supUnit || userId === eventData.createdBy) {
                        return resolve({ ok: true, obj: { supEstablishment: supEstablishment, supUnit: supUnit } });
                    } else {
                        return resolve({ ok: false, msg: 'Sin permiso' });
                    }
                }
            });
        });
    },
    findAndCreateDuplicates: eventData => {
        return new Promise((resolve, reject) => {
            if (!eventData) {
                return async.setImmediate(() => reject('Sin datos'));
            }
            var moment = require('moment');
            var dateFilter = moment(moment().year() + '0101').toDate();
            dateFilter.setHours(0, 0, 0, 0);

            var filter = {
                id: { '!': eventData.id },
                patient: eventData.patient,
                createdAt: { '>': dateFilter },
                eventType: eventData.eventType,
                establishment: eventData.establishment,
                status: { '!': [duplicatedId, rejectId] }
            };

            if (!eventData.patient) filter.occurrenceService = eventData.occurrenceService;

            AdverseEvent.find(filter).then(result => {
                if (result.length > 0) {
                    async.each(result, (eventResult, cb) => {
                        DuplicatedEvent.create({
                            origin: eventResult.id,
                            duplicated: eventData.id,
                            establishment: eventData.establishment
                        })
                            .then(duplicated => cb())
                            .catch(err => cb(err));
                    }, err => {
                        if (err) return reject(err);
                        return resolve();
                    });
                } else {
                    return resolve();
                }
            }).catch(err => console.log(err));
        })
    },
    isFinalizedStatus: id => {
        return new Promise((resolve, reject) => {
            AdverseEventStatus
                .find({ id: id, deleted: false, finished: true })
                .exec((err, status) => {
                    if (err) {
                        return reject(err);
                    } else {
                        if (status.length === 0) {
                            return resolve(false);
                        } else {
                            return resolve(true);
                        }
                    }
                });
        });
    },
    isDuplicatedStatus: id => {
        return id === duplicatedId;
    },
    getRejectedStatus: () => {
        return [rejectId, duplicatedId];
    },
    getSupervised: (idEmployee, filter = {}) => {
        return new Promise((resolve, reject) => {
            var criteriaSupervisedEstablishment = !_.isEmpty(filter.supervisedEstablishment) ? {
                id: filter.supervisedEstablishment
            } : null;
            var criteriaSupervisedUnits = !_.isEmpty(filter.supervisedUnit) ? {
                id: filter.supervisedUnit
            } : null;
            var supervised = {};
            Employee
                .findOne({
                    id: idEmployee
                })
                .populate('adverseEventEstablishmentSupervised', criteriaSupervisedEstablishment)
                .populate('adverseEventUnitSupervised', criteriaSupervisedUnits)
                .exec((err, data) => {
                    if (err) {
                        return reject(err);
                    } else {
                        if (data) {
                            if ((!_.isEmpty(filter.supervisedEstablishment) && !_.isEmpty(filter.supervisedUnit)) ||
                                (_.isEmpty(filter.supervisedEstablishment) && _.isEmpty(filter.supervisedUnit))) {
                                if ((data.adverseEventEstablishmentSupervised || []).length > 0) {
                                    supervised.establishments = _.map(data.adverseEventEstablishmentSupervised, 'id');
                                }
                                if ((data.adverseEventUnitSupervised || []).length > 0) {
                                    supervised.units = _.map(data.adverseEventUnitSupervised, 'id');
                                }
                            } else {
                                if (!_.isEmpty(filter.supervisedEstablishment)) {
                                    if ((data.adverseEventEstablishmentSupervised || []).length > 0) {
                                        supervised.establishments = _.map(data.adverseEventEstablishmentSupervised, 'id');
                                        supervised.units = null;
                                    }
                                }
                                if (!_.isEmpty(filter.supervisedUnit)) {
                                    if ((data.adverseEventUnitSupervised || []).length > 0) {
                                        supervised.units = _.map(data.adverseEventUnitSupervised, 'id');
                                        supervised.establishments = null;
                                    }
                                }
                            }
                            return resolve(supervised);
                        } else {
                            return resolve({});
                        }
                    }
                });
        });
    },
    cleanDuplicates: event => {
        if (!event) return; // No existe data
        if (event.status === 1) return; // Estado inicial, no valido para esta tarea
        var filter = { verified: false };
        var dataUpdate = { verified: true };
        if (event.status === validateId) { // Si es estado validado, se buscan solo donde es posible duplicado
            filter.duplicated = event.id;
        } else { // Si no se busca en ambos, como posible original y duplicado
            filter.or = [{ origin: event.id }, { duplicated: event.id }];
            if (event.status === duplicatedId) dataUpdate.isDuplicated = true; // Si es duplicado, se setea el valor en true
        }
        DuplicatedEvent.update(filter, dataUpdate).then(() => { });
    },
    sendStatusLogAndNotifications: (eventData, employeeData) => {
        var createLog = adverseEvent => {
            AdverseEventStatusLog
                .create({
                    adverseEvent: adverseEvent.id,
                    createdBy: employeeData.id,
                    status: adverseEvent.status.id
                })
                .exec((err, log) => {
                    if (err) {
                        sails.log(err);
                    } else {
                        AdverseEvent.message(adverseEvent.id, {
                            message: 'adverseEvent:new-status',
                            data: {
                                adverseEvent: adverseEvent.id,
                                createdBy: employeeData.id,
                                type: 'statusChanged',
                                status: adverseEvent.status.id,
                                createdAt: log.createdAt
                            }
                        });
                    }
                });
        };

        var sendEstablishmentSupervisors = (eventData) => {
            Establishment
                .findOne(eventData.establishment)
                .populate('adverseEventSupervisors', { id: { '!': employeeData.id } })
                .then(establishment => {
                    var notifications = [];
                    establishment.adverseEventSupervisors.forEach((employee) => {
                        notifications.push({
                            title: '<span><b>' + employeeData.fullname + '</b> cambió el estado a <b>' + eventData.status.description + '</b> en un evento donde eres supervisor</span>',
                            modelModule: 'adverseEvent',
                            idModelModule: eventData.id,
                            type: 'State-Event-Status',
                            assignedTo: employee.id
                        });
                    });
                    NotificationService.sendNotifications(notifications);
                })
                .catch(err => sails.log(err));
        };

        var sendUnitSupervisors = (eventData) => {
            Unit
                .findOne(eventData.occurrenceService)
                .populate('adverseEventSupervisors', { id: { '!': employeeData.id } })
                .then(unit => {
                    var notifications = [];
                    unit.adverseEventSupervisors.forEach((employee) => {
                        notifications.push({
                            title: '<span><b>' + employeeData.fullname + '</b> cambió el estado a <b>' + eventData.status.description + '</b> en un evento donde eres supervisor</span>',
                            modelModule: 'adverseEvent',
                            idModelModule: eventData.id,
                            type: 'State-Event-Status',
                            assignedTo: employee.id
                        });
                    });
                    NotificationService.sendNotifications(notifications);
                })
                .catch(err => sails.log(err));
        };

        var sendToCreator = (eventData) => {
            NotificationService.sendNotifications({
                title: '<span>Evento notificado cambió de estado a <b>' + eventData.status.description + '</b></span>',
                modelModule: 'adverseEvent',
                idModelModule: eventData.id,
                type: 'State-Event-Status',
                assignedTo: eventData.createdBy
            });
        };

        sendEstablishmentSupervisors(eventData);
        sendUnitSupervisors(eventData);
        sendToCreator(eventData);
        createLog(eventData);
    }
};