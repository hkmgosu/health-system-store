/**
 * RequestStakeholders.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        derivation: {
            model: 'derivation'
        },
        employee: {
            model: 'employee'
        },
        emailSubscription: {
            type: 'boolean',
            defaultsTo: true
        },
        role: {
            type: 'string',
            enum: ['owner', 'supervisor', 'other'],
            defaultsTo: 'other'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};