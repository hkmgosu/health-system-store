/**
 * Storage/ProductRequestStatus.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        id: {
            type: 'integer',
            autoIncrement: false,
            primaryKey: true
        },
        description: {
            type: 'string',
            unique: true,
            required: true,
            size: 20
        },
        statusParent: {
            type: 'integer',
            required: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
}