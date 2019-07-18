/**
 * Storage/ShippingOrder.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        productRequestDetail: {
            model: 'ProductRequestDetail',
            required: true
        },
        date: {
            type: 'date',
            required: true
        },
        originProductStock: {
            model: 'ProductStock',
            required: true
        },
        destinyProductStock: {
            model: 'ProductStock'
        },
        quantitySend: {
            type: 'integer',
            required: true
        },
        quantityReceived: {
            type: 'integer',
            defaultsTo: 0
        },
        createdBy: {
            model: 'Employee'
        },
        updatedBy: {
            model: 'Employee'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },


    beforeUpdate(data, next) {
        if (data.id && data.deleted) {
            Shipping.findOne(data.id).exec((err, shipping) => {
                shipping.quantityReceived ?
                    next('No puede eliminarse, tiene productos recibidos') : next(err);
            });
        } else {
            next();
        }
    },


    afterCreate(values, next) {
        Shipping.find({
                deleted: false,
                productRequestDetail: values.productRequestDetail
            })
            // actualiza cantidad enviada
            .then(shippings => {
                let total = shippings.reduce((acum, el) => acum + el.quantitySend, 0);
                return ProductRequestDetail.update(values.productRequestDetail, {
                    id: values.productRequestDetail,
                    quantitySend: total
                });
            })
            // fin
            .then(() => next())
            .catch(err => next(err));
    },

    afterUpdate(values, next) {
        if (!values.id) return next();

        let productRequest = {};
        let detail = {
            id: values.productRequestDetail,
            hasProblemShipping: false,
            quantitySend: 0,
            quantityReceived: 0
        };

        Shipping.find({
                deleted: false,
                productRequestDetail: values.productRequestDetail
            })

            // actualizar totales enviados y recibidos
            .then(shippings => {
                for (let i = 0; i < shippings.length; ++i) {
                    detail.quantitySend += shippings[i].quantitySend;
                    detail.quantityReceived += shippings[i].quantityReceived;
                    if (shippings[i].quantityReceived &&
                        shippings[i].quantityReceived < shippings[i].quantitySend) {
                        detail.hasProblemShipping = true;
                    }
                }
                if (detail.quantityReceived >= detail.quantity && detail.hasProblemShipping) {
                    detail.hasProblemShipping = false;
                }

                return ProductRequestDetail.update(detail.id, detail);
            })
            .then(() => next())
            .catch(err => next(err));
    }
}