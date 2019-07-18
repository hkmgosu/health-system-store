/**
 * ProductLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: sails.config.models.connectionStorage,
    attributes: {
        description: 'string',
        productRequest: {
            model: 'productRequest',
            required: true,
            index: true
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        unit: {
            model: 'unit'
        },
        comment: 'string',
        reason: 'string',
        type: {
            type: 'string',
            enum: ['created', 'changed', 'statusChanged', 'deleted'],
            required: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};