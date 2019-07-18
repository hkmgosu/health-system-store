/**
 * Comment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        description: 'string',
        attachments: {
            collection: 'archive',
            via: 'comment',
            through: 'commentarchive'
        },
        modelModule: {
            type: 'string',
            required: true,
            enum: [
                'rem', 'request', 'derivation', 'adverseEvent', 'permission', 'viatic', 'workshift'
            ]
        },
        idModelModule: {
            type: 'integer',
            required: true,
            index: true
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};