/**
 * Storage/PurchaseOrderDetail.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        purchaseOrder: {
            model: 'PurchaseOrder',
            required: true
        },
        product: {
            model: 'Product',
            required: true
        },
        quantity: {
            type: 'integer',
            required: true
        },
        unitPrice: {
            type: 'integer',
            defaultsTo: 0
        },
        itemPrice: {
            type: 'integer',
            defaultsTo: 0
        },
        quantityReceived: {
            type: 'integer',
            required: true,
            defaultsTo: 0
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};