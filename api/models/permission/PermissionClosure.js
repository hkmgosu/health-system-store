/**
 * PermissionClosure.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        permissions: {
            collection: 'permission',
            via: 'closure',
        },
        observation: 'string',
        createdBy: {
            model: 'employee'
        },
        correlativeStart: 'integer',
        correlativeEnd: 'integer',
        confirmed: {
            type: 'boolean',
            defaultsTo: false
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};