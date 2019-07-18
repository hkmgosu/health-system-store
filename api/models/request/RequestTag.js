/**
 * RequestTag.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: {
            type: 'string',
            unique: true,
            required: true
        },
        counter: {
            type: 'integer',
            defaultsTo: 0
        },
        requests: {
            collection: 'request',
            via: 'tagsCollection'
        }
    }
};