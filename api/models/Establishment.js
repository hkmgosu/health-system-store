/**
 * Establishment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        shortname: 'string',
        description: 'string',
        addressText: 'string',
        address: {
            model: 'address'
        },
        position: 'json',
        phone: 'string',
        email: 'string',
        website: 'string',
        type: {
            model: 'establishmentType'
        },
        cod: {
            type: 'string',
            unique: true
        },
        bedManagementModuleAvailable: 'boolean',
        bedManagementSupervisors: {
            collection: 'employee',
            via: 'bedManagementEstablishmentSupervised'
        },
        bedManagementSupervisorsCount: {
            type: 'integer',
            defaultsTo: 0
        },
        bedManagementUnitsCount: {
            type: 'integer',
            defaultsTo: 0
        },
        adverseEventModuleAvailable: 'boolean',
        adverseEventSupervisors: {
            collection: 'employee',
            via: 'adverseEventEstablishmentSupervised',
            dominant: true
        },
        adverseEventSupervisorsCount: {
            type: 'integer',
            defaultsTo: 0
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};