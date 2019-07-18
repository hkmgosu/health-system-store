/**
 * Storage/product.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        productCode: {
            type: 'string',
            required: true,
            unique: true,
            size: 20
        },
        description: {
            type: 'string',
            required: true,
            size: 100,
            index: true
        },
        dosage: {
            type: 'float'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        productType: {
            model: 'producttype',
            required: true
        },
        category: {
            model: 'category'
        },
        subCategory: {
            model: 'category'
        },
        presentationType: {
            model: 'presentationtype'
        },
        administrationWay: {
            model: 'administrationway'
        },
        dosageType: {
            model: 'dosagetype'
        },
        drugType: {
            model: 'drugtype'
        },
        public: {
            type: 'boolean',
            defaultsTo: false
        },
        stockParameterList: {
            collection: 'unit',
            via: 'product',
            through: 'stockparameter'
        },
        hasProfilePicture: {
            type: 'boolean',
            defaultsTo: false
        },
        profilePicturePath: 'string',
        unitProductManagedList: {
            collection: 'unit',
            via: 'product',
            through: 'unitproductsmanager'
        },
        logs: {
            collection: 'ProductLog',
            via: 'product'
        },
        productPacks: {
            collection: 'ProductPack',
            via: 'product'
        },
        productStocks: {
            collection: 'ProductStock',
            via: 'product'
        },
        activeComponents: {
            collection: 'activeComponent',
            via: 'product',
            through: 'productactivecomponent'
        },
        searchText: {
            type: 'string',
            size: 300
        },
        weightedPrice: {
            type: 'float'
        },
        isControlled: {
            type: 'boolean',
            defaultsTo: false
        }
    },

    beforeCreate(values, next) {
        if (values.description && values.productCode) {
            Product.count({
                deleted: false,
                or: [{
                    productCode: values.productCode
                }]
            }).then(
                product => {
                    if (product) {
                        let newErr = new Error;
                        newErr.message = 'Código de producto utilizado';
                        newErr.status = 500;
                        return next(newErr);
                    } else {
                        return next();
                    }
                },
                err => {
                    return next(err);
                }
            )
        }
    },

    afterCreate(values, next) {
        if (values.id && values.description) {
            sails.log.info("afterCreate data info ", values);
            Product.findOne(values.id).populate('productType')
                .exec((err, product) => {
                    if (err) return;
                    product.searchText = ''.concat(product.productCode, product.description, product.productType.isPharmaceutical ? 'isPharmaceutical' : '').replace(/(\n|\r)/g, ' ').substr(0, 300);
                    product.save(() => {
                        sails.log.info("aftercreate product searchtext updated ", new Date());
                        return next();
                    });
                });
        } else return next();
    },

    beforeUpdate(values, next) {
        if (!values.id) return next();
        if (values.deleted) {
            // valida que producto a marcar como eliminado
            // no esté asociado a una solicitud
            ProductRequestDetail.count({
                product: values.id,
                deleted: false
            }).exec((err, found) => {
                if (err) return next(err);
                if (!found) return next();

                let newErr = new Error;
                newErr.message = 'Producto es utilizado en solicitudes';
                newErr.status = 500;
                return next(newErr);
            });
        } else {
            next();
        }
    }
};