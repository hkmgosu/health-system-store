/**
 * WorkflowStatus.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http: //sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        order: 'integer',
        type: {
            type: 'string',
            enum: ['open', 'pending', 'closed']
        },
        from: {
            collection: 'workflowStatus',
            via: 'to'
        },
        to: {
            collection: 'workflowStatus',
            via: 'from'
        },
        authorization: {
            type: 'string',
            enum: ['workflow', 'from', 'manager', 'closure', 'owner']
        },
        module: {
            type: 'string',
            enum: ['permission', 'viatic']
        },
        supervisors: {
            collection: 'employee',
            via: 'workflowsSupervisor'
        },
        supervisorsCount: {
            type: 'integer',
            defaultsTo: 0
        },
        isSupervised: 'boolean',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};