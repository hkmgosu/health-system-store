/**
 * StockParameter.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: sails.config.models.connectionStorage,
    attributes: {
        product: {
            model: 'product'
        },
        unit: {
            model: 'unit'
        },
        minStock: {
            type: 'int',
            required: true,
            defaultsTo: 0
        },
        maxStock: {
            type: 'int',
            required: true,
            defaultsTo: 0
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    // beforeCreate(values, next) {
    //     StockParameter.findOne({
    //         product: values.product,
    //         unit: values.unit,
    //         deleted: false
    //     }).exec((err, data) => {
    //         if (err) return next(err);
    //         if (!data) return next();

    //         let newErr = new Error;
    //         newErr.message = 'Tipo de Producto YA EXISTE';
    //         newErr.status = 500;
    //         return next(newErr);
    //     });
    // }
};