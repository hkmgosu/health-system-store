/**
 * RemPatientController
 *
 * @description :: Server-side logic for managing rempatient
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    // Obtener episodio
    get: (req, res) => {
        let idRemPatient = req.body.idRemPatient;
        if (!idRemPatient) { return res.send({ ok: false }); }

        RemPatient.findOne({ id: idRemPatient, deleted: false })
            .populate('transferStatus')
            .then(
                remPatient => res.send({ ok: true, obj: remPatient }),
                err => res.send({ ok: false, msg: err })
            );
    },
    // Obtener historial de signos vitales en un episodio
    getVitalSignsEvolution: (req, res) => {
        let idRemPatient = req.body.idRemPatient;
        if (!idRemPatient) { return res.send({ ok: false }); }

        VitalSigns.find({ remPatient: idRemPatient, deleted: false })
            .populate('createdBy')
            .then(
                vitalSigns => res.send({ ok: true, obj: vitalSigns }),
                err => res.send({ ok: false, obj: err })
            );
    },
    // Obtener historial de medicinas suministradas en un episodio
    getMedicineHistory: (req, res) => {
        let idRemPatient = req.body.idRemPatient;
        if (!idRemPatient) { return res.send({ ok: false }); }

        RemPatientMedicines.find({ prescribed: idRemPatient, deleted: false })
            .populate('medicine')
            .populate('createdBy')
            .populate('via')
            .then(
                medicines => res.send({ ok: true, obj: medicines }),
                err => res.send({ ok: false, obj: err })
            );
    },
    create: (req, res) => {
        let remPatient = _.pick(req.body.remPatient, ['id', 'patient', 'rem', 'triage', 'triageObservation']);
        if (!remPatient) { return res.badRequest(); }

        async.waterfall([
            // Save patient
            (cb) => {
                if (remPatient.patient.id) {
                    Patient.update(remPatient.patient.id, remPatient.patient).exec(
                        (err, patientUpdated) => cb(err, patientUpdated[0])
                    );
                } else {
                    Patient.create(remPatient.patient).exec(cb);
                }
            },
            // Create remPatient
            (patientSaved, cb) => {
                remPatient.patient = patientSaved.id;
                RemPatient.create(remPatient).then(remPatientCreated => {
                    remPatientCreated.patient = patientSaved;
                    cb(null, remPatientCreated);
                }, cb);
            }], (err, remPatientCreated) => {
                if (err) { return res.send({ ok: false, obj: err }); }

                RemLogPatient.create({
                    rem: remPatientCreated.rem,
                    remPatient: remPatientCreated.id,
                    patient: remPatientCreated.patient,
                    createdBy: req.session.employee.id,
                    data: JSON.stringify(remPatientCreated.patient),
                    type: 'patientCreated'
                }).exec(() => { });

                res.send({ ok: true, obj: remPatientCreated });
            });
    },
    // Obtener detalle de una atención para mostrar en historial clínico del paciente
    getHistoryItemDetails: (req, res) => {
        let idRemPatient = req.body.idRemPatient;
        if (!idRemPatient) { return res.send({ ok: false }); }

        var getEmployees = (cb, ids) => Employee.find({ id: ids }).exec(cb);

        var getMedicines = (cb, medicines) => {
            RemPatientMedicines.find({ id: medicines })
                .populate('medicine')
                .populate('createdBy')
                .populate('via')
                .exec(cb);
        };

        RemPatient.findOne({ id: idRemPatient, deleted: false })
            .populate('vitalSigns')
            .populate('medicines', { deleted: false })
            .populate('transferStatus')
            .populate('observations')
            .then((remPatient) => {
                let users = _.map(remPatient.observations, 'createdBy');
                users = _.uniq(users.concat(_.map(remPatient.vitalSigns, 'createdBy')));
                let medicines = _.map(remPatient.medicines, 'id');

                async.parallel({
                    employees: cb => getEmployees(cb, users),
                    medicines: cb => getMedicines(cb, medicines)
                }, (err, results) => {
                    if (err) {
                        return res.send({ ok: false, msg: err, obj: {} });
                    }
                    _.map(remPatient.observations, observation => {
                        observation.createdBy = (_.filter(results.employees, { id: observation.createdBy }) || [])[0];
                    });
                    _.map(remPatient.vitalSigns, record => {
                        record.createdBy = (_.filter(results.employees, { id: record.createdBy }) || [])[0];
                    });
                    remPatient.medicines = results.medicines;
                    res.send({ ok: true, obj: remPatient });
                });
            }, err => res.send({ ok: false, msg: err, obj: {} }));
    }
};