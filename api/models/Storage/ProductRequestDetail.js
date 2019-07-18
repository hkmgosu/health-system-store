/**
 * Storage/ProductRequestDetail.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        productRequest: {
            model: 'ProductRequest',
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
        quantityBoss1: {
            type: 'integer',
            required: true
        },
        quantityBoss2: {
            type: 'integer',
            required: true
        },
        quantitySend: {
            type: 'integer',
            defaultsTo: 0
        },
        quantityReceived: {
            type: 'integer',
            defaultsTo: 0
        },
        status: 'integer',
        subprogram: {
            model: 'Program'
        },
        hasProblemShipping: {
            type: 'boolean',
            defaultsTo: false
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        shippings: {
            collection: 'Shipping',
            via: 'productRequestDetail'
        }
    },

    beforeDestroy(criteria, next) {
        // verifica que no se elimine un detalle con envios asociados
        ProductRequestDetail.find(criteria).populate('product').populate('shippings')
            .then(results => {
                results.forEach(detail => {
                    if (detail.shippings.length) {
                        return next(`Detalle {detail.product.description}, tiene envios asociados`);
                    }
                    return next();
                });
            })
            .catch(err => next(err));
    }
};