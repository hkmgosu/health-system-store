/**
 * ViaticLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        viatic: { model: 'viatic' },
        type: {
            type: 'string',
            enum: ['statusChanged']
        },
        createdBy: { model: 'employee' },
        status: { model: 'workflowStatus' },
        comment: 'string'
    },
    afterCreate: (log, cb) => {
        ViaticLog.findOne(log.id)
            .populate('createdBy')
            .populate('status')
            .then(log => {
                Viatic.message(log.viatic, {
                    message: 'viaticLog',
                    data: log
                });
            });
        cb();
    }
};

