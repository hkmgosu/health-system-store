/**
 * RequestStakeholders.js
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
        employee: {
            model: 'employee'
        },
        subscribed: {
            type: 'boolean',
            defaultsTo: true
        },
        role: {
            type: 'string',
            enum: ['owner', 'assigned', 'other'],
            defaultsTo: 'other'
        },
        createdBy: {
            model: 'employee'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};