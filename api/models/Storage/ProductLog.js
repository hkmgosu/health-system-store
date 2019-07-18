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
        product: {
            model: 'product',
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
            enum: ['productCreated', 'dataGeneralChanged', 'clasificationChanged', 'imageChanged',
                'imageDeleted', 'unitManagerCreated', 'unitManagerDeleted', 'unitStockCreated',
                'unitStockUpdated', 'unitStockDeleted', 'productPackCreated', 'productPackUpdated',
                'productPackDeleted', 'productActiveComponentCreated', 'productActiveComponentUpdated', 'productActiveComponentDeleted'

            ],
            required: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};