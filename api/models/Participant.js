/**
 * Participant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        startTime: 'datetime',
        endTime: 'datetime',
        careTeam: { model: 'careTeam', index: true },
        remVehicle: { model: 'remVehicle', index: true },
        workshift: { model: 'workshift', index: true },
        member: {
            model: 'employee',
            required: true
        },
        job: { model: 'job' },
        role: {
            type: 'string',
            enum: ['driver', 'nurse', 'paramedic', 'doctor', 'other']
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

