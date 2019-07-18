/**
 * FormMedication.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        medicine: {
            model: 'medicineService'
        },
        via: {
            model: 'medicinevia'
        },
        consequences: {
            collection: 'eventconsequence',
            via: 'formsMed'
        },
        stageError: {
            model: 'stageerror'
        },
        typeError: {
            model: 'medicationtypeerror'
        },
        adverseEvent: {
            model: 'adverseEvent'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};