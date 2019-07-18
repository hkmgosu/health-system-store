/**
 * RegulatorObservation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        medical: 'string',
        diagnostic: 'string',
        administrative: 'string',
        coordination: 'boolean',
        nurseAdvice: 'boolean',
        medicalAdvice: 'boolean',
        remPatient: {
            model: 'rempatient',
            required: true
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};