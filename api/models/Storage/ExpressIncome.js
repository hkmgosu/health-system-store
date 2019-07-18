/**
 * Storage/ExpressIncome.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        destinyUnit: {
            model: 'Unit'
        },
        status: {
            type: 'integer',
            required: true,
            defaultsTo: 1
        },
        date: {
            type: 'date',
            required: true,
            defaultsTo: new Date()
        },
        details: {
            collection: 'ExpressIncomeDetail',
            via: 'expressIncome'
        },

        // documents
        numShippingOrder: {
            type: 'string',
            size: 20
        },
        requestBy: {
            type: 'string',
            size: 20
        },
        numInvoice: 'integer',
        idChileCompra: {
            type: 'string',
            size: 20
        },
        numPurchaseOrder: 'integer',
        datePurchaseOrder: 'date',
        yearPurchaseOrder: 'integer',
        priceTotal: {
            type: 'integer',
            defaultsTo: 0
        },
        // documents: fin

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