/**
 * Resource.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        model: 'string',
        manufacturer: 'string',
        observations: 'string',
        type: {
            model: 'resourcetype'
        },
        serialNumber: 'string',
        phoneNumber: 'string',
        ipAddress: 'string',
        macAddress: 'string',
        contractNumber: 'string',
        contractCompany: 'string',
        plan: 'string',
        planDetails: 'string',
        unit: {
            model: 'unit'
        },
        establishment: {
            model: 'establishment'
        },
        jsonData: 'json',
        status: {
            model: 'resourcestatus'
        },
        employees: {
            collection: 'employee',
            via: 'resource',
            through: 'employeeresource'
        },
        currentEmployeeResource: {
            model: 'employeeresource'
        },
        currentEmployee: {
            model: 'employee'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};