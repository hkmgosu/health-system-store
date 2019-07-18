/**
 * AdverseEvent.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        patient: {
            model: 'patient'
        },
        typePatient: {
            type: 'string',
            enum: ['ambulatory', 'hospitalized', 'homehospitalization']
        },
        patientAdmissionAt: 'date',
        patientDiagnostic: {
            type: 'string',
            defaultsTo: ''
        },
        damageType: {
            model: 'damagetype'
        },
        eventType: {
            model: 'adverseeventtype'
        },
        associatedProcess: {
            model: 'associatedprocess'
        },
        formId: 'integer',
        formType: {
            type: 'string',
            enum: ['FormGeneral', 'FormFall', 'FormMedication', 'FormUpp']
        },
        typeNotification: {
            type: 'string',
            enum: ['normal', 'withoutPatient']
        },
        createdBy: {
            model: 'employee'
        },
        status: {
            model: 'adverseeventstatus',
        },
        originOccurrence: {
            model: 'originoccurrence'
        },
        occurrenceService: {
            model: 'unit'
        },
        reportService: {
            model: 'unit'
        },
        occurrenceAt: 'datetime',
        establishment: {
            model: 'establishment'
        },
        eventDescription: 'string',
        immediateActions: 'string',
        notifiedPatient: 'boolean',
        damagePatient: 'string',
        originalEvent: { //Apunta a evento original en caso de ser un evento duplicado
            model: 'adverseevent'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};