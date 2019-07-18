/**
 * Rem.js
 *
 * @description :: TODO : You might write a short summary of how this model works and what it represents here.
 * @docs        :: http : //sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        createdBy: {
            model: 'employee'
        },
        callReason: {
            model: 'CallReason'
        },
        subCallReason: {
            model: 'SubCallReason'
        },
        status: {
            model: 'RemStatus'
        },
        address: 'string',
        originAddress: {
            model: 'address'
        },
        destinationAddress: {
            model: 'address'
        },
        referenceAddress: 'string',
        hasPriority: 'boolean',
        priority: 'string',
        applicantName: 'string',
        applicantPhone: 'string',
        applicantType: {
            model: 'ApplicantType'
        },
        description: 'string',
        position: {
            type: 'json'
        },
        commune: {
            model: 'Commune'
        },
        region: {
            model: 'Region'
        },
        addressZone: 'string',
        patients: {
            collection: 'patient',
            via: 'rem',
            through: 'rempatient'
        },
        patientsIncremental: {
            type: 'integer',
            defaultsTo: 0
        },
        vehicles: {
            collection: 'vehicle',
            via: 'rem',
            through: 'remvehicle'
        },
        callCounter: {
            type: 'integer',
            defaultsTo: 1
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }, afterCreate: (rem, cb) => {
        RemLog.create({
            rem: rem.id,
            createdBy: rem.createdBy,
            status: rem.status,
            type: 'statusChanged'
        }).exec(() => { });

        cb();
    }
};