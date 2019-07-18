/**
 * PermissionLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        permission: {
            model: 'permission'
        },
        createdBy: {
            model: 'employee'
        },
        status: {
            model: 'workflowstatus'
        },
        type: {
            type: 'string',
            enum: ['statusChanged']
        },
        comment: 'string'
    },
    afterCreate: (log, cb) => {
        PermissionLog.findOne(log.id)
            .populate('createdBy')
            .populate('status')
            .then(log => {
                Permission.message(log.permission, {
                    message: 'permissionLog',
                    data: log
                });
            });
        cb();
    }
};
