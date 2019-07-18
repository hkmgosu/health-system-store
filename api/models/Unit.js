/**
 * Unit.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        description: 'string',
        uuid: 'string',
        type: {
            model: 'unitType'
        },
        establishment: {
            model: 'establishment'
        },
        parent: {
            model: 'unit'
        },
        level: 'integer',
        employees: {
            collection: 'employee',
            via: 'unit'
        },
        employeeCounter: {
            type: 'integer',
            defaultsTo: 0
        },
        supervisorsCount: {
            type: 'integer',
            defaultsTo: 0
        },
        supervisors: {
            collection: 'employee',
            via: 'supervisedUnits'
        },
        requestType: {
            type: 'string',
            enum: ['public', 'private']
        },
        derivationModuleAvailable: 'boolean',
        cod: {
            type: 'string',
            unique: true
        },
        hierarchy: 'string',
        adverseEvent: 'boolean',
        adverseEventSupervisors: {
            collection: 'employee',
            via: 'adverseEventUnitSupervised',
            dominant: true
        },
        adverseEventSupervisorsCount: {
            type: 'integer',
            defaultsTo: 0
        },
        stockParameterList: {
            collection: 'product',
            via: 'unit',
            through: 'stockparameter'
        },
        storage: {
            type: 'boolean',
            defaultsTo: true
        },
        isPharmaceutical: {
            type: 'boolean',
            defaultsTo: false
        },
        storageManagerList: {
            collection: 'employee',
            via: 'unit',
            through: 'storagemanager'
        },
        storageManagerListCount: {
            type: 'integer',
            defaultsTo: 0
        },
        unitProductManagerList: {
            collection: 'product',
            via: 'unit',
            through: 'unitproductsmanager'
        },
        inventories: {
            collection: 'inventory',
            via: 'unit'
        },
        /* dsp */
        members: {
            collection: 'employee',
            via: 'unit',
            through: 'employeeunit'
        },
        membersCount: {
            type: 'integer',
            defaultsTo: 0
        },
        vipUnit: {
            type: 'boolean',
            defaultsTo: false
        },
        /* /dsp */
        roomList: {
            collection: 'room',
            via: 'unit'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};