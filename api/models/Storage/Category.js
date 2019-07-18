/**
 * Storage/Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: sails.config.models.connectionStorage,
    attributes: {
        description: {
            type: 'string',
            required: true,
            size: 100
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        category: {
            model: 'Category'
        },
        subCategories: {
            collection: 'Category',
            via: 'category'
        }
    }
};