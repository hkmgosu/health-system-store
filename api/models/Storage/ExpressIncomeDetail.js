/**
 * Storage/ExpressIncomeDetail.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        expressIncome: {
            model: 'ExpressIncome',
            required: true
        },
        product: {
            model: 'Product'
        },
        productCode: 'string',
        productDescription: 'string',
        quantity: {
            type: 'integer',
            required: true
        },
        priceItem: {
            type: 'integer',
            defaultsTo: 0
        },
        lot: 'string',
        expiration: 'date',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};