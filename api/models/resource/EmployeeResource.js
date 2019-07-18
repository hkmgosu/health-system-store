/**
 * EmployeeResource.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        employee: {
            model: 'employee'
        },
        resource: {
            model: 'resource'
        },
        startDate: 'datetime',
        endDate: 'datetime',
        observations: 'string',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};