/**
 * Workshift.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        startTime: 'datetime',
        endTime: 'datetime',
        establishment: { model: 'establishment' },
        createdBy: { model: 'employee' },
        title: 'string',
        careTeamList: {
            collection: 'careTeam',
            via: 'workshift'
        },
        validated: 'boolean',
        validatedBy: { model: 'employee' },
        validatedAt: 'datetime',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

