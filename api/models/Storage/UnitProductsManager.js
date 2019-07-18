/**
 * Storage/UnitProductsManager.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: sails.config.models.connectionStorage,
    attributes: {
        product: {
            model: 'product',
            required: true,
        },
        unit: {
            model: 'unit',
            required: true,
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};