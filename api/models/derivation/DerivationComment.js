/**
 * DerivationComment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        description: 'string',
        derivation: {
            model: 'derivation',
            required: true,
            index: true
        },
        attachments: {
            collection: 'archive',
            via: 'derivationCommentList'
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