/**
 * RequestUnitAssignmentLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        request: {
            model: 'request'
        },
        assignedTo: {
            model: 'unit',
            required: true
        },
        assignedOld: {
            model: 'unit'
        },
        createdBy: {
            model: 'employee'
        },
        comment: 'string'
    }
};