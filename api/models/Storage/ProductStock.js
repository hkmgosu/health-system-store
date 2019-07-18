/**
 * Storage/ProductStock.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        productLot: {
            model: 'ProductLot',
            required: true
        },
        location: {
            model: 'Location',
            required: true
        },
        product: {
            model: 'Product',
            required: true
        },
        unit: {
            model: 'Unit',
            required: true
        },
        stock: {
            type: 'integer',
            required: true,
            defaultsTo: 0
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
}