/**
 * RemAccess.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        rem: {
            model: 'rem',
            required: true,
            index: true
        },
        employee: {
            model: 'employee',
            required: true
        },
        ip: 'string',
        count: {
            type: 'integer',
            defaultsTo: 0
        }
    }
};
