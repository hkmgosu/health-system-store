/**
 * Storage/Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        rut: {
            type: 'string',
            required: true,
            size: 15
        },
        name: {
            type: 'string',
            required: true,
            size: 100
        },
        address: {
            type: 'string',
            required: true,
            size: 100
        },
        city: {
            type: 'string',
            required: true,
            size: 100
        },
        isLaboratory: {
            type: 'boolean',
            required: true,
            defaultsTo: true
        },
        email: {
            type: 'string',
            required: true
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