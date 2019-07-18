/**
 * CareTeam.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        workshift: { model: 'workshift' },
        vehicle: { model: 'vehicle' },
        type: {
            type: 'string',
            enum: ['baseTeam', 'vehicleTeam']
        },
        participantList: {
            collection: 'participant',
            via: 'careTeam'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

