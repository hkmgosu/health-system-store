/**
 * DuplicatedEvent.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http: //sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        origin: {
            model: 'adverseevent'
        },
        duplicated: {
            model: 'adverseevent'
        },
        verified: {
            type: 'boolean',
            defaultsTo: false
        },
        establishment: {
            model: 'establishment'
        },
        isDuplicated: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};