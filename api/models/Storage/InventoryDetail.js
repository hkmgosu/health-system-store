/**
 * Storage/Inventory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        inventory: {
            model: 'Inventory',
            required: true
        },
        product: {
            model: 'Product',
            required: true
        },
        softwareStock: {
            type: 'int',
            required: true
        },
        realStock: {
            type: 'int'
        },
        observation: {
            type: 'string'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },

    // events
    beforeCreate(values, next) {
        if (values.rut) {
            var rutjs = require('rutjs');
            var rut = new rutjs(values.rut);
            if (rut.validate() && values.rut.length <= 15) {
                values.rut = rut.getCleanRut();
            } else {
                let newErr = new Error;
                newErr.message = 'RUT no valido!';
                newErr.status = 500;
                return next(newErr);
            }
        }
        next();
    },

    beforeUpdate(values, next) {
        if (values.rut) {
            var rutjs = require('rutjs');
            var rut = new rutjs(values.rut);
            if (rut.validate() && values.rut.length <= 15) {
                values.rut = rut.getCleanRut();
            } else {
                let newErr = new Error;
                newErr.message = 'RUT no valido!';
                newErr.status = 500;
                return next(newErr);
            }
        }
        next();
    }
};