/**
 * RequestStakeholdersLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        request: {
            model: 'request'
        },
        employee: {
            model: 'employee'
        },
        type: {
            type: 'string',
            enum: ['stakeholder:added', 'stakeholder:removed']
        },
        createdBy: {
            model: 'employee'
        }
    }
};