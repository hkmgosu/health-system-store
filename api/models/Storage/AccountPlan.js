/**
 * Storage/AccountPlan.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: sails.config.models.connectionStorage,
    attributes: {
        year: {
            type: 'integer',
            required: true,
            size: 4
        },
        code: {
            type: 'string',
            required: true,
            size: 30
        },
        description: {
            type: 'string',
            required: true,
            size: 100
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },

    beforeCreate(values, cb) {
        AccountPlan.findOne({
            year: values.year,
            code: values.code,
            deleted: false
        }).exec((err, data) => {
            if (err) return cb(err);

            // si no existe registro continua
            if (!data) return cb();

            // si el registro existe, enviar mensaje de error
            let newErr = new Error;
            newErr.message = require('util').format('Year/Code duplicate', data);
            newErr.status = 500;
            return cb(newErr);
        });
    }
};