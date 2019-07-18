/**
 * RemLogPatient.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        rem: {
            model: 'rem',
            required: true,
            index: true
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        remPatient: {
            model: 'rempatient'
        },
        patient: {
            model: 'patient',
            required: true
        },
        data: {
            type: 'json'
        },
        type: {
            type: 'string',
            enum: [
                'patientCreated',
                'patientEdited',
                'patientRemoved',
                'multiplePatientsCreated',
                'patientIntervention',
                'patientBasicEvolution',
                'patientVitalSigns',
                'addPatientMedicine',
                'patientDataEvolution',
                'removePatientMedicine',
                'patientAssociated'
            ]
        },
        remVehicle: { model: 'remVehicle' },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    afterCreate: (log, cb) => {
        RemLogPatient.findOne(log.id)
            .populate('createdBy')
            .then(remLogPatient => {
                RemPatient.findOne(remLogPatient.remPatient).then(remPatient => {

                    async.parallel({
                        patient: cb => {
                            Patient.findOne(remPatient.patient).populate('address').exec(cb);
                        },
                        remVehicle: cb => {
                            if (!remPatient.vehicle) { return async.setImmediate(cb); }
                            RemVehicle.findOne(remPatient.vehicle).populate('vehicle').exec(cb);
                        }
                    }, (err, results) => {
                        if (err) { return sails.log(err); }
                        remPatient.patient = results.patient;
                        remLogPatient.remVehicle = results.remVehicle;
                        remLogPatient.patient = results.patient;
                        Rem.message(remLogPatient.rem, {
                            message: 'remLogPatient',
                            data: {
                                log: remLogPatient,
                                remPatient: remPatient
                            }
                        });
                    });

                }, err => sails.log(err));
            }, err => sails.log(err));
        cb();
    }
};