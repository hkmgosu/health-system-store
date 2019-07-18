/**
 * WorkshiftLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        workshift: {
            model: 'workshift',
            required: true,
            index: true
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        type: {
            type: 'string',
            enum: ['participantAdded', 'participantRemoved', 'participantMoved', 'careTeamAdded', 'careTeamRemoved', 'workshiftActivated', 'workshiftUpdated']
        },
        member: { model: 'employee' },
        vehicle: { model: 'vehicle' },
        //participant: { model: 'Participant' },
        //careTeam: { model: 'CareTeam' },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    afterCreate: (log, next) => {
        WorkshiftLog.findOne(log.id)
            .populate('vehicle')
            .populate('member')
            .populate('createdBy')
            .then(logFinded => {
                Workshift.message(log.workshift, {
                    message: 'logCreated',
                    data: logFinded
                });
            });

        next();
    }
};

