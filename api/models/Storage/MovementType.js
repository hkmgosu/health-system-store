/**
 * Storage/MovementType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        description: {
            type: 'string',
            required: true,
            size: 100
        },
        isInput: 'boolean',
        isOutput: 'boolean',

        documentRequired: {
            type: 'boolean',
            defaultsTo: false
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};