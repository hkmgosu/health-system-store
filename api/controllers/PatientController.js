/**
 * PatientController
 *
 * @description :: Server-side logic for managing patients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    /**
     * Guarda o actualiza un paciente
     */
    save: function (req, res) {
        if (req.body.patient) {
            var rut = req.body.patient.identificationNumber;
            if (req.body.patient.identificationType === 'rut') {
                if (req.body.patient.identificationNumber) {
                    var rutjs = require('rutjs');
                    rut = new rutjs(req.body.patient.identificationNumber);
                    if (rut.validate()) {
                        rut = rut.getCleanRut();
                    } else {
                        return res.send({ ok: false, msg: 'Rut invalido', obj: {} });
                    }
                } else {
                    return res.send({ ok: false, msg: 'Rut invalido', obj: {} });
                }
            }
            if (req.body.patient.id) {
                Patient.findOne({ id: req.body.patient.id, deleted: false }).then(patient => {
                    if (!patient) { return res.send({ ok: false }); }
                    if (patient.address && _.isObject(req.body.patient.address) && !_.isEmpty(req.body.patient.address)) {
                        req.body.patient.address.id = patient.address;
                    }
                    Patient.update(req.body.patient.id, req.body.patient).exec(function (err, data) {
                        if (err) {
                            return res.send({ ok: false, msg: 'PATIENT.ERROR.UPDATE', obj: err });
                        } else {
                            return res.send({ ok: true, msg: 'PATIENT.SUCCESS.SAVE', obj: { patient: data[0] } });
                        }
                    });
                }, err => res.send({ ok: false }));
            } else {
                Patient.findOne({
                    identificationKey: (req.body.patient.identificationType || '') + (rut || '')
                }).then(
                    patient => {
                        if (patient) {
                            return res.send({ ok: true, msg: 'PATIENT.SUCCESS.EXISTS', obj: { patient: patient } });
                        } else {
                            Patient.create(req.body.patient).exec(function (err, data) {
                                if (err) {
                                    return res.send({ ok: false, msg: 'PATIENT.ERROR.CREATE', obj: err });
                                } else {
                                    return res.send({ ok: true, msg: 'PATIENT.SUCCESS.SAVE', obj: { patient: data } });
                                }
                            });
                        }
                    },
                    err => {
                        return res.send({ ok: false, msg: 'PATIENT.ERROR.CREATE', obj: err })
                    }
                );
            }
        } else {
            return res.send({ ok: false, msg: 'PATIENT.ERROR.CREATE' });
        }
    },
    /**
     * Borra un paciente
     */
    delete: function (req, res) {
        Patient.update({
            id: req.body.id
        }, {
                deleted: true,
                identificationKey: null
            }).exec(function (err, data) {
                if (err) {
                    sails.log(err);
                    return res.send({ msg: 'PATIENT.ERROR.DELETE', ok: false, obj: { error: err } });
                } else {
                    sails.log(data);
                    return res.send({ msg: 'PATIENT.SUCCESS.DELETE', ok: true });
                }
            });
    },
    /**
     * Obtiene datos Paciente desde Minsal, indicando Rut
     */
    getExternalPatient: (req, res) => {
        if (!req.body.identificationNumber && req.body.identificationType) {
            return res.send({ ok: false, msg: 'Ingresar datos identificación', obj: {} });
        }
        if (req.body.identificationType === 'rut') {
            MinsalService.getPatient(req.body.identificationNumber).then(
                patient => res.send({ ok: true, obj: patient }),
                err => res.send({ ok: false, msg: err.msg || '', obj: err.obj || {} })
            );
        } else {
            res.send({ ok: false, msg: 'De momento disponible solo obtención de datos por rut', obj: {} });
        }
    },
    /**
     * Obtener listado paginado de pacientes
     */
    getList: function (req, res) {
        var filterText = (req.body.filter || '')
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036F\.\-]/g, '');
        filterText = '%' + filterText.replace(/\s+/g, '%') + '%';
        var filter = {
            or: [
                { fullname: { 'like': filterText || '' } },
                { identificationKey: { 'like': filterText || '' } }
            ],
            identificationType: { '!': 'nn' },
            deleted: false
        };
        let paginate = _.defaults(req.body.paginate || {}, { page: 1, limit: 15 });

        async.parallel({
            total: cb => Patient.count(filter).exec(cb),
            list: cb => Patient.find(filter)
                .populate('address')
                .paginate(paginate)
                .exec(cb)
        }, (err, results) => {
            if (err) { return res.send({ ok: false, obj: err }); }
            res.send({ ok: !_.isEmpty(results.list), obj: results });
        });
    },
    /**
     * Obtener historia clínica del paciente
     */
    getClinicalHistory: (req, res) => {

        let idPatient = req.body.idPatient;
        if (!idPatient) { return res.send({ ok: false, obj: [] }); }

        RemPatient.find({
            patient: idPatient,
            deleted: false
        }).then(remPatients => {
            async.each(remPatients, (remPatient, cb) => {
                Rem.findOne({ id: remPatient.rem })
                    .populate('callReason')
                    .populate('subCallReason')
                    .then(rem => {
                        remPatient.rem = rem;
                        cb();
                    }, cb);
            }, err => {
                if (err) { return res.send({ ok: false, obj: err }); }
                res.send({ ok: true, obj: remPatients });
            });
        }, err => res.send({ ok: false, obj: err }));
    },
    identifyPatient: (req, res) => {
        let { idOldPatient, idNewPatient } = req.body;
        if (!idOldPatient || !idNewPatient) { return res.send({ ok: false }); }

        Patient.find({ id: [idOldPatient, idNewPatient] }).then(patientList => {
            let oldPatient = _.find(patientList, { id: idOldPatient });
            let newPatient = _.find(patientList, { id: idNewPatient });
            if (_.isEmpty(oldPatient) || _.isEmpty(newPatient)) { return res.send({ ok: false }); }
            let finalPatient = Object.assign(oldPatient.toJSON(), newPatient.toJSON());
            Patient.update(finalPatient.id, finalPatient).then(() => {
                RemPatient.findOne({
                    patient: idOldPatient,
                    deleted: false
                }).then(remPatient => {
                    if (!remPatient) { return res.send({ ok: false }) }
                    remPatient.patient = idNewPatient;
                    remPatient.save(err => {
                        if (err) { sails.log(err); }
                        Patient.findOne(idNewPatient).populate('address').then(
                            patient => {
                                RemLogPatient.create({
                                    rem: remPatient.rem,
                                    remPatient: remPatient.id,
                                    patient: remPatient.patient,
                                    createdBy: req.session.employee.id,
                                    data: patient,
                                    type: 'patientEdited'
                                }).exec(() => { });
                                res.send({ ok: true, obj: patient });
                            }
                        );

                        IdentifiedPatient.create({
                            nn: idOldPatient,
                            patient: idNewPatient,
                            remPatient: remPatient.id
                        }).exec(() => { });

                    });
                }, err => res.send({ ok: false, obj: err }));
            });
        });
    }
};

