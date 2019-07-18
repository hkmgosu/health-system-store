/**
 * Permission.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        owner: { model: 'employee' },
        type: { model: 'permissiontype' },
        unit: { model: 'unit' },
        reason: 'string',
        attachments: {
            collection: 'archive',
            via: 'permission',
            through: 'permissionarchive'
        },
        detailsDay: 'array',
        fromDate: 'date',
        untilDate: 'date',
        duration: 'string',
        status: {
            model: 'workflowstatus'
        },
        statusLog: 'string',
        closure: {
            model: 'permissionclosure'
        },
        correlativeNumber: 'integer',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};