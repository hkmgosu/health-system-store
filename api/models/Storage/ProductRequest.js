/**
 * Storage/ProductRequest.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        date: {
            type: 'date',
            required: true
        },
        correlative: 'integer',
        isPharmaceutical: 'boolean',
        isControlled: 'boolean',
        glosa: {
            type: 'string',
            size: 3000
        },
        status: {
            model: 'ProductRequestStatus',
            required: true,
            defaultsTo: 1
        },
        costCenter: {
            model: 'CostCenter'
        },
        originUnit: {
            model: 'Unit', // unidad que solicita los productos
            required: true
        },
        destinyUnit: {
            model: 'Unit', // bodega a la que se solicita
            required: true
        },
        details: {
            collection: 'ProductRequestDetail',
            via: 'productRequest'
        },
        createdBy: {
            model: 'employee'
        },
        updatedBy: {
            model: 'employee'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        searchText: {
            type: 'string',
            size: 300
        }
    },

    beforeUpdate(values, next) {
        if (values.id && values.glosa) {
            values.searchText = ''.concat(values.id, values.glosa)
                .replace(/(\n|\r)/g, ' ').substr(0, 300);
        }

        if (values.id && values.status == 1) {
            ProductRequestDetail.find({
                    productRequest: values.id
                }).populate('shippings')
                .then(details => {
                    let newError = null;
                    for (let i = 0; i < details.length; ++i) {
                        if (details[i].shippings.length) {
                            newError = new Error;
                            newError.status = 500;
                            newError.message = 'Error: Solicitud tiene envios emitidos';
                            next(newError);
                            break;
                        }
                    }
                    next(newError);
                }).catch(err => next(err));
        } else {
            next();
        }
    },

    afterUpdate(record, next) {
        if (!record || !record.id) return next();

        // marcar eliminado el detalle de la solicitud
        if (record.deleted) {
            ProductRequestDetail.update({
                productRequest: record.id,
                deleted: false
            }, {
                deleted: true
            }).then(() => {}).catch(err => {});
        }

        // si el nuevo estado es enviado, los detalles no anulados son enviados
        if (record.status && record.status == 2) {
            ProductRequestDetail.update({
                productRequest: record.id,
                status: 1
            }, {
                status: 2
            }).then(() => {}).catch(err => {});
        }

        next();
    },

    beforeCreate(recordToCreate, proceed) {

        ProductRequest
            .findOne({
                destinyUnit: recordToCreate.destinyUnit,
                isPharmaceutical: recordToCreate.isPharmaceutical,
                isControlled: recordToCreate.isControlled,
            })
            .sort('id DESC')
            .then(lastRequest => {
                recordToCreate.correlative = lastRequest ? lastRequest.correlative++ : 1;
                proceed();
            });

    }


};