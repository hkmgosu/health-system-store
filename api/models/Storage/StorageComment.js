/**
 * Storage/StorageComment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        table: {
            type: 'string',
            required: true
        },
        idRecord: {
            type: 'integer',
            required: true
        },
        type: 'string',
        description: {
            type: 'string',
            size: 1500
        },
        createdBy: {
            model: 'employee'
        },
        attachments: {
            collection: 'Archive',
            via: 'comment',
            through: 'storagecommentarchive'
        }
    }
};