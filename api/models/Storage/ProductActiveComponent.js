/**
 * StorageManager.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        product: {
            model: 'product'
        },
        activeComponent: {
            model: 'activeComponent'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};