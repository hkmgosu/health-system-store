/**
 * RemPatient.js
 *
 * @description :: TODO  : You might write a short summary of how this model works and what it represents here.
 * @docs        :: http  : //sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        descriptionIntervention: 'string',
        diagnosticIntervention: 'string',
        observations: {
            collection: 'regulatorobservation',
            via: 'remPatient'
        },
        triage: {
            type: 'string',
            enum: ['rojo', 'verde', 'amarillo', 'negro']
        },
        triageObservation: 'string',
        typeTransfer: {
            type: 'string',
            enum: ['primary', 'secondary']
        },
        setAttentions: {
            collection: 'attentionitem',
            via: 'remPatient',
            through: 'attentionprovided'
        },
        vitalSigns: {
            collection: 'vitalsigns',
            via: 'remPatient'
        },
        medicines: {
            collection: 'rempatientmedicines',
            via: 'prescribed'
        },
        patient: {
            model: 'Patient'
        },
        vehicle: {
            model: 'remvehicle'
        },
        rem: {
            model: 'Rem',
            index: true
        },
        incrementalID: 'integer',
        hasIntervention: {
            type: 'boolean',
            defaultsTo: false
        },
        criticalIntervention: 'boolean',
        adhocCall: 'boolean',
        transferStatus: {
            collection: 'transferstatus',
            via: 'remPatient'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    beforeCreate: (remPatient, cb) => {
        if (!remPatient.incrementalID) {
            Rem.findOne(remPatient.rem).then(rem => {
                remPatient.incrementalID = ++rem.patientsIncremental;
                rem.save();
                cb();
            });
        } else {
            cb();
        }
    }
};