/**
 * Storage/PurchaseOrder.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: sails.config.models.connectionStorage,
    attributes: {
        date: {
            type: 'date',
            required: true
        },
        glosa: {
            type: 'string',
            required: true,
            size: 3000
        },
        status: {
            type: 'string',
            required: true,
            enum: ['draft', 'send', 'received', 'closed'],
            defaultTo: 'draft'
        },
        details: {
            collection: 'PurchaseOrderDetail',
            via: 'purchaseOrder'
        },
        totalPrice: {
            type: 'integer',
            defaultsTo: 0
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};