/**
 * Storage/PlanCenabast.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        year: {
            type: 'integer',
            required: true
        },
        month: {
            type: 'integer',
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
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};