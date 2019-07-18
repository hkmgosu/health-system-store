/**
 * UnitProductsManagerController
 *
 * @description :: Server-side logic for managing producttypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    save: (req, res) => {
        // buscar o crear configuracion
        UnitProductsManager.findOrCreate(req.body.unitProductsManager, req.body.unitProductsManager)
            .then(config => {
                if (config.deleted == true) {
                    return UnitProductsManager.update(req.body.unitProductsManager, {
                        deleted: false
                    });
                } else {
                    return [config];
                }

            }, err => res.send({
                ok: false,
                obj: err
            }))
            .then(config => {
                UnitProductsManager.findOne(config[0].id).populateAll().exec((err, unitProductsManager) => {
                    // si hubo error o no existe registro, enviar error
                    if (err || !unitProductsManager) return res.send({
                        ok: false,
                        obj: err,
                        msg: "error al buscar la unidad configurada"
                    });

                    let dataLog = {
                        product: unitProductsManager.product.id,
                        createdBy: req.session.employee.id,
                        unit: unitProductsManager.unit.id,
                        type: 'unitManagerCreated'
                    };

                    // create comment
                    let dataComment = {
                        table: 'product',
                        idRecord: unitProductsManager.product.id,
                        type: 'unitsChanged',
                        createdBy: req.session.employee.id
                    };

                    Promise.all([
                        ProductLog.create(dataLog),
                        StorageComment.create(dataComment)
                    ]).then(results => {
                        const product = unitProductsManager.product;
                        if (!dataComment.createAt) dataComment.createAt = new Date();
                        Product.message(product.id, {
                            message: 'product:new-comment',
                            data: dataComment
                        });

                        let message = 'unknow';
                        if (dataComment.type == 'generalChanged') message = 'product:new-general';
                        if (dataComment.type == 'clasificationChanged') message = 'product:new-clasification';
                        if (dataComment.type == 'imageChanged') message = 'product:new-image';
                        if (dataComment.type == 'stocksChanged') message = 'product:new-stocks';
                        if (dataComment.type == 'unitsChanged') message = 'product:new-units';

                        Product.message(product.id, {
                            message,
                            data: product
                        });

                        res.send({
                            ok: true,
                            msg: `Configuración agregada para el producto`,
                            obj: {
                                unitProductsManager
                            }
                        });
                    }, err => res.send({
                        ok: false,
                        obj: err,
                        msg: "error al guardar log y comment"
                    }));
                });
            }, err => res.send({
                ok: false,
                obj: err
            }));
    },

    getAll(req, res) {
        let criteria = {};
        criteria.where = req.body.where || {};
        criteria.where.deleted = false;
        UnitProductsManager.find(criteria)
            .then(unitProductsManagers => res.send({
                ok: true,
                msg: 'Registros encontrados',
                obj: {
                    unitProductsManagers
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al consultar productos permitidos en unidades',
                obj: err
            }));
    },

    get: (req, res) => {
        let idUnitProductManager = req.body.idUnitProductManager;
        if (!idUnitProductManager) {
            return res.send({
                ok: false
            });
        }
        UnitProductsManager.findOne({
                id: idUnitProductManager,
                deleted: false
            })
            .then(
                storageManagerFound => res.send({
                    ok: !_.isEmpty(storageManagerFound),
                    obj: storageManagerFound
                }),
                () => res.send({
                    ok: false
                })
            );
    },

    getProductStoragesStock: (req, res) => {

        if (!req.body.id) {
            return res.send({
                ok: false,
                obj: "no se ha enviado el parámetro de producto"
            });
        }

        sails.log.info("begin get productStock by unit");

        Unit.find({
                storage: true,
                deleted: false
            }).then(storages => {
                sails.log.info("storages", storages.length);
                return ProductStock.find({
                    unit: _.map(storages, 'id'),
                    deleted: false,
                    product: req.body.id
                }).populate("unit");
            })
            .then(productStock => {
                let resumedStock = [];
                sails.log.info('productStock by unit', productStock.length);
                productStock.forEach(stock => {
                    let stockExist = _.find(resumedStock, {
                        unit: stock.unit
                    });
                    if (stockExist) {
                        stockExist.stock = stockExist.stock + stock.stock;
                    } else {
                        resumedStock.push({
                            unit: stock.unit,
                            stock: stock.stock
                        });
                    }
                });
                // sails.log.info('resumed', resumedStock);
                res.send({
                    ok: true,
                    msg: "unidades del producto encontradas",
                    obj: {
                        productStock: resumedStock
                    }
                });
            }, err => res.send({
                ok: false,
                msg: "error al buscar unidades del producto",
                obj: err
            }));

    },

    /**
     * retorna todas las unidades que han sido marcadas como bodega
     * @param {*} req 
     * @param {*} res 
     */
    getStorages(req, res) {
        let where = req.body.where || {};
        where.deleted = false;
        where.storage = true;
        let criteria = {
            where: where,
            sort: 'name ASC'
        };
        Unit.find(criteria).populate('establishment')
            .then(units => res.send({
                ok: true,
                msg: 'Bodegas encontradas',
                obj: {
                    units
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al consultar unidades',
                obj: err
            }));
    },


    getAllowedUnits: (req, res) => {
        let criteria = {};
        criteria.where = req.body.where || {};
        criteria.where.deleted = false;
        criteria.where.employee = req.session.employee.id;

        StorageManager.find(criteria).populate('unit', {
            deleted: false,
            storage: true
        }).exec((err, results) => {
            // si existe error retornar error
            if (err) return res.send({
                ok: false,
                obj: err
            });

            // dejar en un array las unidades permitidas
            let units = [];
            let exists = [];
            for (let i = 0; i < results.length; ++i) {
                // si la unidad no ha sido eliminada, se agrega al array
                // se omite si ya esta en la lista

                if (results[i].unit && !results[i].unit.deleted && exists.indexOf(results[i].unit.id) == -1) {
                    units.push(results[i].unit);
                    exists.push(results[i].unit.id);
                }
            }

            return res.send({
                ok: true,
                obj: {
                    units
                }
            });
        });
    },

    getProductUnits: (req, res) => {
        // id unidades asignadas y que no hallan sido eliminadas
        StorageManager.find({
            deleted: false,
            employee: req.session.employee.id
        }).populate('unit', {
            deleted: false, // unidades vigentes (?) 
            level: {
                '!': -1
            },
            storage: true
        }).then(configs => {
                // desde config se extrae unidades y luego sus id para el filtro
                let units = _.map(_.map(configs, 'unit'), unit => {
                    if (unit) return unit.id;
                });
                // buscar unidades del producto segun unidades del funcionario
                UnitProductsManager.find({
                    product: req.body.id,
                    deleted: false,
                    unit: units
                }).populate('unit').then(
                    results => {
                        return res.send({
                            ok: true,
                            obj: {
                                total: results.length,
                                list: results
                            }
                        });
                    },
                    err => {
                        sails.log.warn('getProductUnits UnitProductsManager find', err);
                        return res.send({
                            ok: false,
                            obj: err
                        });
                    }
                );

            },
            err => {
                sails.log.warn('getProductUnits StorageManager find', err);
                return res.send({
                    ok: true,
                    obj: err
                });
            });
    },

    delete: (req, res) => {
        let idUnitProductsManager = req.body.id;
        if (!idUnitProductsManager) return res.send({
            ok: false
        });

        UnitProductsManager.findOne({
            id: idUnitProductsManager,
            deleted: false
        }).populateAll().exec((err, unitProductsManager) => {
            unitProductsManager.deleted = true;
            unitProductsManager.save((err, unitProductsManager) => {
                // si hubo error, enviar error
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                let dataLog = {
                    product: unitProductsManager.product.id,
                    createdBy: req.session.employee.id,
                    unit: unitProductsManager.unit.id,
                    type: 'unitManagerDeleted'
                };

                ProductLog.create(dataLog).exec((err, productLog) => {
                    // si hubo error, enviar error
                    if (err) return res.send({
                        ok: false,
                        obj: err
                    });

                    res.send({
                        ok: true,
                        msg: `Configuración eliminada para el producto`,
                        obj: {
                            unitProductsManager
                        }
                    });
                }); // productLog
            });
        });
    },

    unsubscribe: (req, res) => {
        Product.unsubscribe(req, req.body.id);
    },
};