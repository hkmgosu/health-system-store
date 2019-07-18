/**
 * RemPatientMedicines.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        medicine: {
            model: 'medicine',
        },
        via: {
            model: 'medicinevia'
        },
        prescribed: {
            model: 'rempatient'
        },
        quantity: 'integer',
        dose: 'string',
        prescribedAt: 'date',
        createdBy: {
            model: 'employee'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};