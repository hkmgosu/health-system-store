/**
 * VitalSigns.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        pad: 'string',
        o2: 'string',
        co2: 'string',
        fio2: 'string',
        hgt: 'string',
        pas: 'string',
        ecg: 'string',
        temperature: 'string',
        glasgow: 'string',
        pulse: 'string',
        rts: 'string',
        breathingFrequency: 'string',
        takenAt: 'datetime',
        remPatient: {
            model: 'rempatient'
        },
        createdBy: {
            model: 'employee'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};