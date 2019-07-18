/**
 * Viatic.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        createdBy: {
            model: 'employee'
        },
        type: {
            type: 'string',
            enum: ['contabilidad', 'partes', 'tesoreria']
        },
        viaticList: {
            collection: 'viatic',
            via: 'closureList'
        },
        totalAmount: 'integer',
        viaticCount: 'integer',
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

