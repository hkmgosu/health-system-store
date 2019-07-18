/**
 * Area.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        geometry: {
            type: 'json',
            required: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        name: 'string',
        color: 'string',
        category: {
            type: 'string',
            enum: ['rural', 'urbano']
        },
        isPublic: 'boolean'
    }
};