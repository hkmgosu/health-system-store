/**
 * Storage/productController
 *
 * @description :: Server-side logic for managing storage/products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * obtiene todos los datos
     * @param {*} req
     * @param {*} res
     */
    getAll(req, res) {

        if (req.body.page && req.body.limit) {
            return this.getPaginate(req, res);
        }
        let filter = {};
        filter.where = req.body.where || {};
        filter.where.deleted = false;
        filter.sort = 'description';

        if (req.body.filter) filter.where.searchText = {
            'contains': req.body.filter
        };

        Product
            .find(filter)
            .populate('productType')
            .populate('drugType')
            .populate('administrationWay')
            .populate('presentationType')
            .populate('dosageType')
            .populate('category')
            .populate('subCategory')
            .exec((err, products) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });
                return res.send({
                    ok: true,
                    obj: {
                        found: products.length,
                        products
                    }
                });
            });
    },

    /**
     * obtiene los datos con paginacion
     * @param {*} req
     * @param {*} res
     */
    getPaginate(req, res) {

        let filter = {};
        filter.where = req.body.where || {};
        filter.where.deleted = false;
        filter.sort = 'description';

        if (req.body.filter) {
            filter.where.searchText = {
                'contains': req.body.filter
            };
        }

        let paginate = {
            page: req.body.page || 1,
            limit: req.body.limit
        };

        async.parallel({
            found: cb => {
                Product.count(filter).exec(cb);
            },
            products: cb => {
                Product
                    .find(filter)
                    .populate('productType')
                    .populate('drugType')
                    .populate('administrationWay')
                    .populate('presentationType')
                    .populate('dosageType')
                    .populate('category')
                    .populate('subCategory')
                    .paginate(paginate).exec(cb);
            }
        }, (err, results) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: results
            });
        });
    },

    /**
     * obtiene un registro por id
     * @param {*} req
     * @param {*} res
     */
    get(req, res) {
        Product
            .findOne({
                id: req.body.id,
                deleted: false
            })
            .exec((err, product) => {
                if (err) {
                    return res.send({
                        ok: false,
                        obj: err
                    });
                }
                if (!product) {
                    return res.send({
                        ok: false,
                        msg: 'PRODUCT.SEARCH.NOT_FOUND',
                        obj: err
                    });
                }
                return res.send({
                    ok: true,
                    msg: 'PRODUCT.SEARCH.FOUND',
                    obj: product
                });
            });
    },

    /**
     * Retorna los comentarios realizados al producto especifico
     * @param {*} req
     * @param {*} res
     */
    getComments(req, res) {
        let controller = this;
        Product.subscribe(req, [req.body.id]);

        StorageComment.find({
                where: {
                    table: 'product',
                    idRecord: req.body.id
                },
                sort: {
                    createdAt: 'DESC'
                }
            })
            .populate('createdBy')
            .populate('attachments')
            .exec((err, comments) => {
                if (err) return res.send({
                    ok: false,
                    msg: 'Error al buscar comentarios',
                    obj: err
                });

                res.send({
                    ok: true,
                    obj: {
                        comments
                    }
                });
            });
    },


    /**
     * crea un registro y retorna sus datos
     * @param {*} req
     * @param {*} res
     */
    create(req, res) {
        Product.create(req.body.product).exec((err, product) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });

            Product.findOne(product.id).populate('productType').then(productFound => {
                // se guarda log del producto creado
                let dataLog = {
                    product: product.id,
                    createdBy: req.session.employee.id,
                    type: 'productCreated'
                };

                // create comment
                let dataComment = {
                    table: 'product',
                    idRecord: product.id,
                    type: 'created',
                    createdBy: req.session.employee.id
                };

                Promise.all([
                    ProductLog.create(dataLog),
                    StorageComment.create(dataComment)
                ]).then(() => {}).catch(() => {});

                // se crea la relacion producto-unidad del funcionario
                // quien lo crea
                StorageManager.find({
                    employee: req.session.employee.id,
                    deleted: false
                }).populate('unit').then(managedUnits => {
                    if (managedUnits && managedUnits.length === 0) return res.send({
                        ok: false,
                        msg: `Producto ${req.body.product.description} no se ha creado, Usuario sin unidades para asignar al producto`,
                        obj: {
                            product: req.body.product
                        }
                    });

                    // array de promises para su ejecución
                    let arrayPromises = [];
                    for (let managedUnit of managedUnits) {
                        if (productFound.productType.isPharmaceutical === managedUnit.unit.isPharmaceutical) {
                            arrayPromises.push(UnitProductsManager.create({
                                product: product.id,
                                unit: managedUnit.unit.id
                            }));
                            arrayPromises.push(StockParameter.create({
                                product: product.id,
                                unit: managedUnit.unit.id
                            }));
                        }
                    }

                    // guardar unidades del producto en configuración
                    Promise.all(arrayPromises).then(managedUnitsCreated => {
                        return res.send({
                            ok: true,
                            msg: `Producto ${product.description} se ha creado, configurado su stock y las unidades para el usuario.`,
                            obj: {
                                product
                            }
                        });
                    }, err => {
                        sails.log.warn('error al guardar configuración');
                        sails.log.warn(err);
                        return res.send({
                            ok: false,
                            msg: 'error al guardar configuración',
                            obj: err
                        })
                    });
                });
            });

            ////
        });
    },

    /**
     * actualiza un registro por id y retorna sus datos
     * @param {*} req
     * @param {*} res
     */
    update(req, res) {
        const controller = this;

        let dataId = {
            id: req.body.product.id,
            deleted: false
        };
        let dataUpdate = req.body.product;

        let dataLog = {
            product: dataUpdate.id,
            createdBy: req.session.employee.id
        };

        // create comment
        let dataComment = {
            table: 'product',
            idRecord: dataUpdate.id,
            createdBy: req.session.employee.id
        };

        if (req.body.product.description) {
            // data general
            dataLog.type = 'dataGeneralChanged';
            dataComment.type = 'generalChanged';
        }
        if (req.body.product.category) {
            // data clasificacion
            dataLog.type = 'clasificationChanged';
            dataComment.type = 'clasificationChanged';
        }

        Product.subscribe(req, [req.body.product.id]);

        // ejecuta las intrucciones secuencialmente
        // asi no se crea log si hubo error en producto
        Promise.all([
                // actualizar producto
                Product.update(dataId, dataUpdate),
                // guardar log
                ProductLog.create(dataLog),
                // crear el comentario de lo modificado
                StorageComment.create(dataComment)
            ])
            .then(results => Product.findOne(dataId).populate('productType'))
            .then(productToUpdate => {
                let searchText = ''.concat(productToUpdate.productCode,
                    productToUpdate.description, productToUpdate.productType.isPharmaceutical ? 'isPharmaceutical' : ''
                ).replace(/(\n|\r| )/g, ' ').substr(0, 300);
                return Product.update(dataId, {
                    searchText
                })
            })
            .then(productUpdated => {

                sails.log.info("producto actualizado: ", productUpdated);
                // enviar lo modificado al navegador
                dataComment.createdBy = req.session.employee;
                controller.sendMessageChanged(dataComment, dataUpdate);

                // en caso de exito, enviar mensaje y data del producto
                return res.send({
                    ok: true,
                    msg: `Producto: ${productUpdated[0].description} actualizado`,
                    obj: {
                        product: productUpdated[0]
                    }
                })
            }).
        catch(err => {
            sails.log.warn("error al actualizar producto: ", err);
            return res.send({
                ok: false,
                msg: "Error al actualizar Producto " + dataUpdate.description,
                obj: err
            });
        });
    },

    /**
     * elimina un registro por id, retorna los datos anteriores
     * @param {*} req
     * @param {*} res
     */
    delete(req, res) {

        Product.update({
                id: req.body.id,
                deleted: false
            }, {
                deleted: true,
                id: parseInt(req.body.id)
            })
            .then(
                products => res.send({
                    ok: true,
                    msg: `Producto: ${products[0].description} eliminado`,
                    obj: {
                        product: products[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    },


    getLogs: (req, res) => {
        ProductLog.find({
            deleted: false,
            product: req.body.id
        }).populateAll().exec((err, productLogs) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });

            return res.send({
                ok: true,
                obj: {
                    productLogs
                }
            });
        });
    },

    /**
     * parametros para campos de formulario
     *
     */
    getParams: function(req, res) {

        // Se obtiene la tabla de Tipos de Productos
        let getAllProductType = (callback) =>
            ProductType.find({
                deleted: false
            }).exec(function(err, productTypes) {
                callback(null, productTypes);
            });

        // Se obtienen la tabla de Tipos de Drogas
        let getAllDrugType = (callback) =>
            DrugType.find({
                deleted: false
            }).exec(function(err, drugTypes) {
                callback(null, drugTypes);
            });

        // Se obtienen la tabla de Tipos de Drogas
        let getAllAdministrationWay = (callback) =>
            AdministrationWay.find({
                deleted: false
            }).exec(function(err, administrationWays) {
                callback(null, administrationWays);
            });

        // Se obtienen la tabla de Tipos de Presentación
        let getAllPresentationType = (callback) =>
            PresentationType.find({
                deleted: false
            }).exec(function(err, presentationType) {
                callback(null, presentationType);
            });

        // Se obtienen la tabla de Tipo de Dosificación
        let getAllDosageType = (callback) =>
            DosageType.find({
                deleted: false
            }).exec(function(err, dosageTypes) {
                callback(null, dosageTypes);
            });

        // Se obtienen la tabla de Categoria
        let getAllCategory = (callback) =>
            Category.find({
                deleted: false
            }).exec(function(err, categories) {
                callback(null, categories);
            });

        // Se obtienen la tabla de Compañias
        let getAllCompany = (callback) =>
            Company.find({
                deleted: false
            }).exec(function(err, companies) {
                callback(null, companies);
            });

        // Se obtienen la tabla de Tipo de Unidad
        let getAllUnit = (callback) =>
            Unit.find({
                deleted: false
            }).exec(function(err, units) {
                callback(null, units);
            });

        // Se obtienen la tabla de Tipo de Unidad
        let getAllPackType = (callback) =>
            PackType.find({
                deleted: false
            }).exec(function(err, units) {
                callback(null, units);
            });

        // Se obtienen la tabla de Tipo de Unidad
        let getAllTypeUnitMeasure = (callback) =>
            TypeUnitMeasure.find({
                deleted: false
            }).exec(function(err, units) {
                callback(null, units);
            });

        async.parallel([
                getAllProductType,
                getAllDrugType,
                getAllAdministrationWay,
                getAllPresentationType,
                getAllDosageType,
                getAllCategory,
                getAllCompany,
                getAllUnit,
                getAllPackType,
                getAllTypeUnitMeasure
            ],
            (err, results) => {
                if (err) {
                    sails.log(err);
                    res.send({
                        ok: false,
                        msg: '',
                        obj: err
                    });
                } else {
                    res.send({
                        ok: true,
                        msg: '',
                        obj: {
                            productTypes: results[0],
                            drugTypes: results[1],
                            administrationWays: results[2],
                            presentationTypes: results[3],
                            dosageTypes: results[4],
                            categories: results[5],
                            companies: results[6],
                            unit: results[7],
                            packTypes: results[8],
                            typeUnitMeasures: results[9]
                        }
                    });
                }
            });
    },

    /**
     * Trae Parámetros de Stock del Producto por Unidad
     *
     */
    getStockParameters: function(req, res) {
        // id unidades asignadas y que no hallan sido eliminadas
        StorageManager.find({
            deleted: false,
            employee: req.session.employee.id
        }).populate('unit', {
            // deleted: false, // unidades vigentes (?)
            level: {
                '!': -1
            }
        }).then(configs => {
                // desde config se extrae unidades y luego sus id para el filtro
                let units = _.map(_.map(configs, 'unit'), 'id');
                // buscar unidades del producto segun unidades del funcionario
                StockParameter.find({
                        product: req.body.id,
                        deleted: false,
                        unit: units
                    })
                    .populate('unit')
                    .then(
                        results => {
                            if (!results) {
                                return res.send({
                                    ok: false,
                                    msg: 'PRODUCT.SEARCH.NOT_FOUND',
                                    obj: err
                                });
                            }
                            return res.send({
                                ok: true,
                                msg: 'PRODUCT.SEARCH.FOUND',
                                obj: results
                            });
                        },
                        err => {
                            sails.log.warn('getStockParameters StockParameter find', err);
                            return res.send({
                                ok: false,
                                obj: err
                            });
                        }
                    );

            },
            err => {
                sails.log.warn('getStockParameters StorageManager find', err);
                return res.send({
                    ok: true,
                    obj: err
                });
            });
    },

    saveStockParameter(req, res) {
        const controller = this;

        Product.subscribe(req, [req.body.stockParameter.product]);

        // create comment
        let dataComment = {
            table: 'product',
            idRecord: req.body.stockParameter.product,
            type: 'stockChanged',
            createdBy: req.session.employee.id
        };

        let saveLog = (dataUpdated) => {
            let dataLog = {
                createdBy: req.session.employee.id,
                product: dataUpdated.product.id,
                unit: dataUpdated.unit.id,
                type: 'unitStockCreated'
            };

            // create comment
            let dataComment = {
                table: 'product',
                idRecord: dataUpdated.product.id,
                type: 'stocksChanged',
                createdBy: req.session.employee.id
            };

            Promise.all([
                // crear log
                ProductLog.create(dataLog),
                // crear comment
                StorageComment.create(dataComment)
            ]).then(results => {
                // enviar lo modificado al navegador
                dataComment.createdBy = req.session.employee;
                controller.sendMessageChanged(dataComment, {
                    id: dataUpdated.product.id
                });

                res.send({
                    ok: true,
                    msg: `Parámetros Guardados`,
                    obj: {
                        stockParameter: dataUpdated
                    }
                });
            }).catch(err => res.send({
                ok: false,
                obj: err
            }));
        };

        // buscar stock para la unidad y revivir el registro
        StockParameter.findOne({
            unit: req.body.stockParameter.unit,
            product: req.body.stockParameter.product,
        }).populateAll().exec((err, stockParameterExist) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });

            if (stockParameterExist) {
                // revive registro eliminado
                StockParameter.update({
                    id: stockParameterExist.id
                }, {
                    deleted: false,
                    minStock: req.body.stockParameter.minStock,
                    maxStock: req.body.stockParameter.maxStock
                }).then(spUpdated => {
                    // guardar el log
                    let stockParameter = {
                        id: spUpdated[0].id,
                        unit: stockParameterExist.unit,
                        product: stockParameterExist.product,
                        minStock: spUpdated[0].minStock,
                        maxStock: spUpdated[0].maxStock,
                        deleted: spUpdated[0].deleted
                    };

                    saveLog(stockParameter);
                }, err => {
                    return res.send({
                        ok: false,
                        obj: err
                    });
                });
            } else {
                // crear registro de stock si no existe
                StockParameter.create(req.body.stockParameter)
                    .then(spCreated => StockParameter.findOne(spCreated.id).populateAll())
                    .then(spCreated => {
                        // guardar el log
                        saveLog(spCreated);

                    }, err => res.send({
                        ok: false,
                        obj: err
                    }))
            }
        });
    },

    removeStockParameter(req, res) {
        const controller = this;
        // marcar como eliminado el registro
        StockParameter.update({
            id: req.body.id,
            deleted: false
        }, {
            deleted: true
        }).exec((err, stockParameters) => {
            // si hubo error o no ho se modificaron registros, envio error
            if (err || !stockParameters.length) return res.send({
                ok: false,
                obj: err
            });

            // creo el log
            let dataLog = {
                createdBy: req.session.employee.id,
                product: stockParameters[0].product,
                unit: stockParameters[0].unit,
                type: 'unitStockDeleted'
            };

            // create comment
            let dataComment = {
                table: 'product',
                idRecord: stockParameters[0].product,
                type: 'stockChanged',
                createdBy: req.session.employee.id
            };

            Promise.all([
                // crear log
                ProductLog.create(dataLog),
                // crear comentario
                StorageComment.create(dataComment)
            ]).then(results => {
                // enviar dato modificado al navegador
                dataComment.createdBy = req.session.employee;
                controller.sendMessageChanged(dataComment, {
                    id: stockParameters[0].product
                });

                res.send({
                    ok: true,
                    msg: `Parámetro eliminado`,
                    obj: stockParameters[0]
                });
            }).catch(err => res.send({
                ok: false,
                obj: err
            }));
        });
    },


    /**
     *
     *  Download Profile Picture
     *
     */
    downloadProductProfilePicture: function(req, res) {
        let idProduct = req.allParams().id;
        if (!idProduct) {
            return res.badRequest();
        }
        Product.findOne(idProduct).exec(function(err, data) {
            var SkipperDisk = require('skipper-disk');
            var fileAdapter = SkipperDisk();
            res.set('Content-disposition', 'attachment; filename="' + 'Foto' + '"');

            if (err || !data || !data.profilePicturePath) {
                fileAdapter.read('.tmp/public/assets/images/no-image-grey.jpg')
                    .on('error', (err) => res.notFound())
                    .pipe(res);
                return;
            }

            fileAdapter.read(data.profilePicturePath)
                .on('error', function(err) {
                    fileAdapter.read('.tmp/public/assets/images/no-image-grey.jpg')
                        .on('error', (err) => res.notFound())
                        .pipe(res);
                })
                .pipe(res);
        });
    },


    uploadProductProfilePicture(req, res) {
        const controller = this;

        // buscar el producto
        Product.findOne(req.body.idProduct).exec((err, product) => {
            if (err || !product) return res.send({
                ok: false,
                obj: err
            });

            const fse = require('fs-extra');
            // Rutas donde se guardan los archivos
            var basePath = '.tmp/uploads/';
            var dirPath = new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/';

            // administra carpeta de imagenes
            fse.ensureDirSync(basePath + dirPath);

            // Eliminar imagen del producto anterior
            if (product.profilePicturePath) {
                fse.remove(product.profilePicturePath, err => sails.log(err));
            }

            // guardar archivo subido
            req.file('file').upload({
                dirname: dirPath,
                maxBytes: 10000000
            }, (err, filesUploaded) => {
                if (err || _.isEmpty(filesUploaded)) {
                    sails.log('filesUploaded', err);
                    return res.send({
                        ok: false,
                        obj: err
                    });
                }

                // Actualizar registro de funcionario
                product.hasProfilePicture = true;
                product.profilePicturePath = filesUploaded[0].fd;

                let dataLog = {
                    product: product.id,
                    createdBy: req.session.employee.id,
                    type: 'imageChanged'
                };

                // create comment
                let dataComment = {
                    table: 'product',
                    idRecord: product.id,
                    type: 'imageChanged',
                    createdBy: req.session.employee.id
                };

                async.series({
                    // actualizar producto
                    product: cb => product.save(cb),
                    // guardar log
                    log: cb => ProductLog.create(dataLog).exec(cb),
                    // crear comentario
                    comment: cb => StorageComment.create(dataComment).exec(cb)
                }, (err, results) => {
                    // si hubo error, envia error
                    if (err) return res.send({
                        ok: false,
                        obj: err
                    });

                    dataComment.createdBy = req.session.employee;
                    controller.sendMessageChanged(dataComment, results.product);

                    return res.send({
                        ok: true,
                        obj: results
                    });
                });
            });
        });
    },


    deleteProductProfilePicture(req, res) {
        const controller = this;

        Product.findOne(req.body.idProduct).exec((err, product) => {
            // Validar existencia de funcionario
            if (err || !product) return res.send({
                ok: false,
                obj: err
            });

            const fse = require('fs-extra');

            // Eliminar imagen de producto anterior
            if (product.profilePicturePath) {
                fse.remove(product.profilePicturePath, err => sails.log(err));
            }

            // Actualizar registro de producto
            product.hasProfilePicture = false;
            product.profilePicturePath = null;

            let dataLog = {
                product: product.id,
                createdBy: req.session.employee.id,
                type: 'imageDeleted'
            };

            // create comment
            let dataComment = {
                table: 'product',
                idRecord: product.id,
                type: 'imageDeleted',
                createdBy: req.session.employee.id
            };

            async.series({
                // actualizar producto
                product: cb => product.save(cb),
                // guardar log
                log: cb => ProductLog.create(dataLog).exec(cb),
                // guardar comment
                comment: cb => StorageComment.create(dataComment).exec(cb)
            }, (err, results) => {
                // si hubo error, envia error
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                dataComment.createdBy = req.session.employee;
                controller.sendMessageChanged(dataComment, results.product);

                return res.send({
                    ok: true,
                    obj: results
                });
            });
        });
    },

    /**
     * obtiene todos los datos de productos publicos y los no publicos permitidos (unitProductManager)
     * @param {*} req
     * @param {*} res
     */
    getAllowedProducts(req, res) {

        // si viene campo vacio por default se traen los productos permiidos
        if (typeof req.body.allowedOnly == 'undefined') req.body.allowedOnly = true;
        // si viene filtro para productos permitidos para solicitudes
        if (typeof req.body.requestAllowedOnly == 'undefined') req.body.requestAllowedOnly = false;

        if (req.body.allowedOnly) {
            sails.log.info("allowedOnly");
            if (req.body.requestAllowedOnly) {
                sails.log.info("get allowed products for requests");
                this.getSearchRequestAllowed(req, res);
            } else {
                sails.log.info("get products allowedOnly");
                this.getSearchAllowed(req, res);
            }
        } else {
            sails.log.info("get all products");
            this.getSearchAll(req, res);
        }
    }, // getAllowedProducts

    getSearchAll(req, res) {

        // criterio de busqueda de productos
        let criteria = {
            where: {
                deleted: false,
                or: []
            },
            sort: 'description ASC'
        };
        if (req.body.filter) criteria.where.or.push({
            searchText: {
                contains: req.body.filter
            }
        });

        let productTypeWhere = {};
        let productWhere = {};
        if (req.body.productTypeSearch) {

            let searchType = req.body.productTypeSearch;
            if (searchType === "farmacia") productTypeWhere.isPharmaceutical = true;
            if (searchType === "economato") productTypeWhere.isPharmaceutical = false;
            if (searchType === "controlado") {
                productTypeWhere.isPharmaceutical = true;
                productWhere.isControlled = true;
            }
            if (searchType === "nocontrolado") {
                productTypeWhere.isPharmaceutical = true;
                productWhere.isControlled = false;
            }
            if (searchType === "todos") {
                productTypeWhere = {};
                productWhere = {};
            }

            if (productTypeWhere.isPharmaceutical || productWhere.isControlled) {
                criteria.where.searchText = {
                    contains: 'isPharmaceutical'
                };
                criteria.where.isControlled = productWhere.isControlled;
            }
        }

        let promise = new Promise((resolve, reject) => {
            resolve();
        }).then(() => {
            if (req.body.filter) {
                return ProductPack.find({
                    deleted: false,
                    code: {
                        contains: req.body.filter
                    }
                });
            } else {
                return null;
            }
        }).then(productPacks => {
            if (req.body.filter) {
                let idProductPacks = _.pluck(productPacks, "product");
                criteria.where.or.push({
                    id: idProductPacks
                });

                return ActiveComponent.find({
                    deleted: false,
                    description: {
                        contains: req.body.filter
                    }
                });
            } else {
                return null;
            }
        }).then(activeComponents => {
            if (req.body.filter) {
                let idActiveComponents = _.pluck(activeComponents, "id");
                return ProductActiveComponent.find({
                    deleted: false,
                    activeComponent: idActiveComponents
                });
            } else {
                return null;
            }
        }).then(records => {
            if (req.body.filter) {
                let idProductComponents = _.pluck(records, "product");
                criteria.where.or.push({
                    id: idProductComponents
                })
            }
        }).then(() => {
            if (criteria.where.or.length == 0) delete criteria.where.or;
            if (req.body.limit) criteria.limit = req.body.limit;
            let querys = {};

            if (req.body.page && req.body.limit) {
                querys.found = cb => Product.count(criteria.where).exec(cb);
                querys.products = cb => Product.find(criteria)
                    .populate("productType", {
                        deleted: false,
                    })
                    .populate("drugType", {
                        deleted: false
                    })
                    .populate("productPacks", {
                        deleted: false
                    })
                    .populate("activeComponents", {
                        deleted: false
                    })
                    .paginate({
                        page: req.body.page,
                        limit: req.body.limit
                    }).exec(cb);
            } else {
                querys.products = cb => Product.find(criteria)
                    .populate("productType", {
                        deleted: false
                    })
                    .populate("drugType", {
                        deleted: false
                    })
                    .populate("productPacks", {
                        deleted: false
                    })
                    .populate("activeComponents", {
                        deleted: false
                    })
                    .exec(cb);
            }
            async.parallel(querys, (err, obj) => {
                if (err) return res.send({
                    ok: false,
                    msg: 'Error al consultar productos',
                    obj: err
                });
                res.send({
                    ok: true,
                    msg: 'Productos encontrados',
                    obj: obj
                });
            });
        }).catch(err => res.send({
            ok: false,
            msg: 'Error en consulta previas a productos',
            obj: err
        }));
    }, // getSearchAll

    getSearchAllowed(req, res) {

        // criterio de busqueda de productos
        let idAllowedProducts = [];
        let criteria = {
            where: {
                deleted: false,
                or: []
            },
            sort: 'description ASC'
        };
        if (req.body.filter) criteria.where.or.push({
            public: true,
            searchText: {
                contains: req.body.filter
            }
        });

        let productTypeWhere = {};
        let productWhere = {};
        if (req.body.productTypeSearch) {
            let searchType = req.body.productTypeSearch;
            if (searchType === "farmacia") productTypeWhere.isPharmaceutical = true;
            if (searchType === "economato") productTypeWhere.isPharmaceutical, productWhere = false;
            if (searchType === "controlado") {
                productTypeWhere.isPharmaceutical = true;
                productWhere.isControlled = true;
            }
            if (searchType === "nocontrolado") {
                productTypeWhere.isPharmaceutical = true;
                productWhere.isControlled = false;
            }
            if (searchType === "todos") {
                productTypeWhere = {};
                productWhere = {};
            }

            sails.log.info("productTypesearch", req.body.productTypeSearch);

            if (productTypeWhere.isPharmaceutical) {
                criteria.where.searchText = {
                    contains: 'isPharmaceutical'
                };
                criteria.where.isControlled = productWhere.isControlled;
            }
        }

        StorageManager.find({
            deleted: false,
            employee: req.session.employee.id
        }).then(records => {
            let idUnits = _.pluck(records, "unit");
            let criteriaUnit = {
                deleted: false,
                id: idUnits
            };
            if (req.body.productTypeSearch === 'economato') criteriaUnit.isPharmaceutical = false;
            return Unit.find(criteriaUnit);
        }).then(units => {
            let idUnits = _.pluck(units, "id");
            if (req.body.units) {
                idUnits = _.intersection(idUnits, req.body.units);
            }
            return UnitProductsManager.find({
                deleted: false,
                unit: idUnits
            });
        }).then(records => {
            // solo productos permitidos
            idAllowedProducts = _.pluck(records, "product");
            if (req.body.filter) {
                criteria.where.or.push({
                    id: idAllowedProducts,
                    searchText: {
                        contains: req.body.filter
                    }
                });
            } else {
                criteria.where.or.push({
                    public: true
                });
                criteria.where.or.push({
                    id: idAllowedProducts
                });
            }
        }).then(() => {
            if (req.body.filter) {
                return ProductPack.find({
                    deleted: false,
                    code: {
                        contains: req.body.filter
                    }
                });
            } else {
                return null;
            }
        }).then(productPacks => {
            if (req.body.filter) {
                let idProductPacks = _.pluck(productPacks, "product");
                criteria.where.or.push({
                    id: _.intersection(idAllowedProducts, idProductPacks)
                });
            }
        }).then(() => {
            if (req.body.filter) {
                return ActiveComponent.find({
                    deleted: false,
                    description: {
                        contains: req.body.filter
                    }
                });
            } else {
                return null;
            }
        }).then(activeComponents => {
            if (req.body.filter) {
                let idActiveComponents = _.pluck(activeComponents, "id");
                return ProductActiveComponent.find({
                    deleted: false,
                    activeComponent: idActiveComponents
                });
            } else {
                return null;
            }
        }).then(records => {
            if (req.body.filter) {
                let idProductComponents = _.pluck(records, "product");
                criteria.where.or.push({
                    id: _.intersection(idAllowedProducts, idProductComponents)
                })
            }
        }).then(() => {

            let querys = {};
            if (req.body.limit) criteria.limit = req.body.limit;

            if (req.body.page && req.body.limit) {
                querys.found = cb => Product.count(criteria.where).exec(cb);
                querys.products = cb => Product.find(criteria)
                    .populate("productType", {
                        deleted: false
                    })
                    .populate("drugType", {
                        deleted: false
                    })
                    .populate("productPacks", {
                        deleted: false
                    })
                    .populate("activeComponents", {
                        deleted: false
                    })
                    .paginate({
                        page: req.body.page,
                        limit: req.body.limit
                    }).exec(cb);
            } else {
                querys.products = cb => Product.find(criteria)
                    .populate("productType", {
                        deleted: false
                    })
                    .populate("drugType", {
                        deleted: false
                    })
                    .populate("productPacks", {
                        deleted: false
                    })
                    .populate("activeComponents", {
                        deleted: false
                    })
                    .exec(cb);
            }
            async.parallel(querys, (err, obj) => {
                if (err) return res.send({
                    ok: false,
                    msg: 'Error al consultar productos',
                    obj: err
                });
                res.send({
                    ok: true,
                    msg: 'Productos encontrados',
                    obj: obj
                });
            });
        }).catch(err => res.send({
            ok: false,
            msg: 'Error en consulta previas a productos',
            obj: err
        }));
    }, // getSearchAllowed

    getSearchRequestAllowed(req, res) {

        // criterio de busqueda de productos
        let idAllowedProducts = [];
        let criteria = {
            where: {
                deleted: false,
                or: []
            },
            sort: 'description ASC'
        };
        if (req.body.filter) criteria.where.or.push({
            public: true,
            searchText: {
                contains: req.body.filter
            }
        });

        let productTypeWhere = {};
        let productWhere = {};
        if (req.body.productTypeSearch) {
            let searchType = req.body.productTypeSearch;
            if (searchType === "farmacia") productTypeWhere.isPharmaceutical = true;
            if (searchType === "economato") productTypeWhere.isPharmaceutical = false;
            if (searchType === "controlado") {
                productTypeWhere.isPharmaceutical = true;
                productWhere.isControlled = true;
            }
            if (searchType === "nocontrolado") {
                productTypeWhere.isPharmaceutical = true;
                productWhere.isControlled = false;
            }
            if (searchType === "todos") {
                productTypeWhere = {};
                productWhere = {};
            }

            if (productTypeWhere.isPharmaceutical || productWhere.isControlled) {
                criteria.where.searchText = {
                    contains: 'isPharmaceutical'
                };
                criteria.where.isControlled = productWhere.isControlled;
            }
        }

        sails.log.info("test 1", {
            productTypeWhere,
            productWhere
        });

        UnitProductRequest.find({
            deleted: false,
            employee: req.session.employee.id
        }).then(records => {
            sails.log.info("units", records);
            let idUnits = _.pluck(records, "unit");
            let criteriaUnit = {
                deleted: false,
                id: idUnits
            };
            if (req.body.productTypeSearch === 'economato') criteriaUnit.isPharmaceutical = false;
            return Unit.find(criteriaUnit);
        }).then(units => {
            let idUnits = _.pluck(units, "id");
            if (req.body.units) {
                idUnits = _.intersection(idUnits, req.body.units);
            }
            return UnitProductsManager.find({
                deleted: false,
                unit: idUnits
            });
        }).then(records => {
            // solo productos permitidos
            sails.log.info("productos permitidos", records.length);
            idAllowedProducts = _.pluck(records, "product");
            if (req.body.filter) {
                criteria.where.or.push({
                    id: idAllowedProducts,
                    searchText: {
                        contains: req.body.filter
                    }
                });
            } else {
                criteria.where.or.push({
                    public: true
                });
                criteria.where.or.push({
                    id: idAllowedProducts
                });
            }
        }).then(() => {
            if (req.body.filter) {
                return ProductPack.find({
                    deleted: false,
                    code: {
                        contains: req.body.filter
                    }
                });
            } else {
                return null;
            }
        }).then(productPacks => {
            if (req.body.filter) {
                let idProductPacks = _.pluck(productPacks, "product");
                criteria.where.or.push({
                    id: _.intersection(idAllowedProducts, idProductPacks)
                });
            }
        }).then(() => {
            if (req.body.filter) {
                return ActiveComponent.find({
                    deleted: false,
                    description: {
                        contains: req.body.filter
                    }
                });
            } else {
                return null;
            }
        }).then(activeComponents => {
            if (req.body.filter) {
                let idActiveComponents = _.pluck(activeComponents, "id");
                return ProductActiveComponent.find({
                    deleted: false,
                    activeComponent: idActiveComponents
                });
            } else {
                return null;
            }
        }).then(records => {
            if (req.body.filter) {
                let idProductComponents = _.pluck(records, "product");
                criteria.where.or.push({
                    id: _.intersection(idAllowedProducts, idProductComponents)
                })
            }
        }).then(() => {

            sails.log.info("criteria", criteria);
            sails.log.info("idAllowed", idAllowedProducts);
            let querys = {};
            if (req.body.limit) criteria.limit = req.body.limit;

            if (req.body.page && req.body.limit) {
                querys.found = cb => Product.count(criteria.where).exec(cb);
                querys.products = cb => Product.find(criteria)
                    .populate("productType", {
                        deleted: false
                    })
                    .populate("drugType", {
                        deleted: false
                    })
                    .populate("productPacks", {
                        deleted: false
                    })
                    .populate("activeComponents", {
                        deleted: false
                    })
                    .paginate({
                        page: req.body.page,
                        limit: req.body.limit
                    }).exec(cb);
            } else {
                querys.products = cb => Product.find(criteria)
                    .populate("productType", {
                        deleted: false
                    })
                    .populate("drugType", {
                        deleted: false
                    })
                    .populate("productPacks", {
                        deleted: false
                    })
                    .populate("activeComponents", {
                        deleted: false
                    })
                    .exec(cb);
            }
            async.parallel(querys, (err, obj) => {
                if (err) return res.send({
                    ok: false,
                    msg: 'Error al consultar productos',
                    obj: err
                });
                res.send({
                    ok: true,
                    msg: 'Productos encontrados',
                    obj: obj
                });
            });
        }).catch(err => res.send({
            ok: false,
            msg: 'Error en consulta previas a productos',
            obj: err
        }));
    }, // getSearchAllowed

    // administrar los pack del producto.
    savePack: (req, res) => {
        const getPackUpdated = (packExist = req.body.productPack) => ProductPack.update({
                id: packExist.id || null,
                code: packExist.code,
                deleted: false
            }, req.body.productPack)
            .then(productPack => productPack[0])
            .then(productPack => {
                    // LOG DE ACTUALIZADO
                    let dataLog = {
                        product: req.body.productPack.product,
                        createdBy: req.session.employee.id,
                        type: 'productPackUpdated'
                    };
                    ProductLog.create(dataLog).then(log => {}, err => res.send({
                        ok: false,
                        obj: err,
                        msg: 'Error al guardar log del producto.'
                    }));

                    return res.send({
                        ok: true,
                        obj: productPack,
                        msg: 'Pack del producto guardado.'
                    });
                },
                err => {
                    return res.send({
                        ok: false,
                        obj: err,
                        msg: 'Error al guardar pack del producto.'
                    });
                });


        const getPackcreated = () => ProductPack.create(req.body.productPack)
            .then(productPack => {
                    let dataLog = {
                        product: req.body.productPack.product,
                        createdBy: req.session.employee.id,
                        type: 'productPackCreated'
                    };
                    ProductLog.create(dataLog).then(log => {}, err => res.send({
                        ok: false,
                        obj: err,
                        msg: 'Error al guardar log del producto.'
                    }));

                    return res.send({
                        ok: true,
                        obj: productPack,
                        msg: 'Pack del producto guardado.'
                    });
                },
                err => {
                    sails.log.warn('err createPack', err);;
                    return res.send({
                        ok: false,
                        obj: err,
                        msg: 'Error al guardar pack del producto.'
                    });
                })


        if (req.body.productPack.id) {
            getPackUpdated();
        } else {
            ProductPack.findOne({
                code: req.body.productPack.code,
                deleted: false
            }).then(packExist => {
                if (packExist) {
                    getPackUpdated(packExist);
                } else {
                    getPackcreated();
                }
            }, err => {
                res.send({
                    ok: false,
                    obj: err,
                    msg: 'Error al verificar código pack del producto. Intente nuevamente.'
                });
            });
        }
    },
    removePack: (req, res) => {
        // marcar como eliminado el registro
        ProductPack.update({
            id: req.body.id,
            deleted: false
        }, {
            deleted: true
        }).then(productPack => {
            let dataLog = {
                product: req.body.product,
                createdBy: req.session.employee.id,
                type: 'productPackDeleted'
            };
            ProductLog.create(dataLog).then(log => {}, err => res.send({
                ok: false,
                obj: err,
                msg: 'Error al guardar log del producto.'
            }));
            res.send({
                ok: true,
                obj: productPack,
                msg: 'Pack removido del producto.'
            });

        }, err => {
            res.send({
                ok: false,
                obj: err,
                msg: 'Error al remover pack del producto.'
            });
        });
    },

    /**
     * retorna listado de packs de producto
     * @param {*} req
     * @param {*} res
     */
    getPacks: function(req, res) {
        let filter = {
            where: {
                product: req.body.product,
                deleted: false
            },
            sort: 'code'
        };
        if (req.body.filter) filter.where.code = {
            'contains': req.body.filter.code
        };
        // id unidades asignadas y que no hallan sido eliminadas
        ProductPack.find(filter)
            .then(productPacks => {
                    return res.send({
                        ok: true,
                        msg: 'PRODUCT_PACK.SEARCH.FOUND',
                        obj: productPacks
                    });
                },
                err => {
                    sails.log.warn('getProductPack err', err);
                    return res.send({
                        ok: false,
                        obj: err
                    });
                });
    },

    /**
     * retorna listado de tipos de pack de producto
     * @param {*} req
     * @param {*} res
     */
    getPackTypes(req, res) {
        let criteria = {};
        criteria.where = req.body.where || {};
        criteria.where.deleted = false;
        PackType.find(criteria)
            .then(packTypes => res.send({
                ok: true,
                msg: 'Tipos de pack encontrados',
                obj: {
                    packTypes
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al buscar tipos de pack',
                obj: err
            }));
    },

    /**
     * crea comentario del registro
     * @param {*} req
     * @param {*} res
     */
    createComment(req, res) {
        if (!req.body.comment.idRecord) {
            return res.send({
                msg: 'REQUEST.ERROR.COMMENTID',
                ok: false
            });
        }
        req.body.comment.table = 'product';
        req.body.comment.type = 'comment';
        req.body.comment.createdBy = req.session.employee.id;

        Product.subscribe(req, [req.body.comment.idRecord]);

        if (req.body.comment.attachments) {
            _.remove(req.body.comment.attachments, archive => {
                if (!archive.id) {
                    return archive;
                }
            });
        }

        // crear el comentario
        StorageComment.create(req.body.comment).exec((err, comment) => {
            if (err) return res.send({
                ok: false,
                msg: 'COMMENT.ERROR.CREATE',
                obj: err
            });

            // agregar los archivos adjuntos
            req.body.comment.attachments.forEach(attach => {
                StorageCommentArchive.create({
                    comment: comment.id,
                    archive: attach.id
                }).exec(() => {});
            });

            comment.createdBy = req.session.employee;
            comment.attachments = req.body.comment.attachments;
            Product.message(comment.idRecord, {
                message: 'product:new-comment',
                data: comment
            });
            return res.send({
                ok: true,
                msg: 'COMMENT.SUCCESS.CREATE',
                obj: comment
            });
        });
    },


    unsubscribe(req, res) {
        Product.unsubscribe(req, req.body.id);
    },


    sendMessageChanged(dataComment, product) {
        if (!dataComment.createAt) dataComment.createAt = new Date();
        Product.message(product.id, {
            message: 'product:new-comment',
            data: dataComment
        });

        let message = 'unknow';
        if (dataComment.type == 'generalChanged') message = 'product:new-general';
        if (dataComment.type == 'clasificationChanged') message = 'product:new-clasification';
        if (dataComment.type == 'imageChanged') message = 'product:new-image';
        if (dataComment.type == 'imageDeleted') message = 'product:delete-image';
        if (dataComment.type == 'stocksChanged') message = 'product:new-stocks';
        if (dataComment.type == 'unitsChanged') message = 'product:new-units';

        Product.message(product.id, {
            message,
            data: product
        });
    },


    /**
     * retorna los lotes de productos
     * @param {*} req
     * @param {*} res
     */
    getLots(req, res) {
        let querys = {};

        let where = req.body.where ? req.body.where : {};
        where.deleted = false;

        let criteria = {};
        criteria.where = where;
        criteria.sort = 'expiration ASC';

        if (req.body.page && req.body.limit) {
            querys.found = ProductLot.count(criteria.where);
            querys.productLots = cb => ProductLot.find(criteria)
                .populate('product')
                .paginate({
                    page: req.body.page,
                    limit: req.body.limit
                })
                .exec(cb);
        } else {
            querys.productLots = cb => ProductLot.find(criteria)
                .populate('product')
                .exec(cb);
        }

        // ejecutar las consultas en paralelo y retornarla
        async.parallel(querys, (err, obj) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj
            });
        });
    },


    /**
     * retorna los stock por unidad y ubicacion
     * @param {*} req
     * @param {*} res
     */
    getStocks(req, res) {
        let querys = {};

        let where = req.body.where ? req.body.where : {};
        where.deleted = false;

        let criteria = {};
        criteria.where = where;

        if (req.body.page && req.body.limit) {
            querys.found = ProductStock.count(criteria.where);
            querys.productStocks = cb => ProductStock.find(criteria)
                .populate('product')
                .populate('productLot')
                .populate('unit')
                .populate('location')
                .paginate({
                    page: req.body.page,
                    limit: req.body.limit
                })
                .exec(cb);
        } else {
            querys.productStocks = cb => ProductStock.find(criteria)
                .populate('product')
                .populate('productLot')
                .populate('unit')
                .populate('location')
                .exec(cb);
        }

        // ejecutar las consultas en paralelo y retornarla
        async.parallel(querys, (err, obj) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj
            });
        });
    },

    /**
     * retorna los productos por productCode basado en el filter
     * @param {*} req
     * @param {*} res
     */

    validateProductCode(req, res) {
        Product.findOne({
            productCode: req.body.productCode
        }).then(codeFound => res.send({
                ok: true,
                msg: "producto encontrado con código " + req.body.productCode,
                obj: {
                    productCode: codeFound
                }
            }),
            err => res.send({
                ok: false,
                msg: "error al buscar código de producto",
                obj: err
            }))
    },



    // administrar los componentes activos del producto
    saveProductActiveComponent: (req, res) => {
        ProductActiveComponent.create(req.body.productActiveComponent)
            .then(created => ProductActiveComponent.findOne(created).populate('product').populate('activeComponent'))
            .then(componentCreated => {
                    let dataLog = {
                        product: req.body.productActiveComponent.product,
                        createdBy: req.session.employee.id,
                        type: 'productActiveComponentCreated'
                    };
                    ProductLog.create(dataLog).then(log => {}, err => {
                        return res.send({
                            ok: false,
                            obj: err,
                            msg: 'Error al guardar log del producto.'
                        })
                    });

                    return res.send({
                        ok: true,
                        obj: componentCreated,
                        msg: 'Component Activo añadido al producto.'
                    });
                },
                err => {
                    sails.log.warn('err createProductActiveComponent', err);;
                    return res.send({
                        ok: false,
                        obj: err,
                        msg: 'Error al guardar componente activo del producto.'
                    });
                })
    },
    removeProductActiveComponent: (req, res) => {
        // marcar como eliminado el registro
        ProductActiveComponent.update({
            id: req.body.id,
            deleted: false
        }, {
            deleted: true
        }).then(componentDeleted => {
            let dataLog = {
                product: req.body.product,
                createdBy: req.session.employee.id,
                type: 'productActiveComponentDeleted'
            };

            ProductLog.create(dataLog).then(log => {}, err => {
                return res.send({
                    ok: false,
                    obj: err,
                    msg: 'Error al guardar log del producto.'
                })
            });

            return res.send({
                ok: true,
                obj: componentDeleted,
                msg: 'Componente Activo removido del producto.'
            });

        }, err => {
            res.send({
                ok: false,
                obj: err,
                msg: 'Error al remover componente del producto.'
            });
        });
    },
    getProductActiveComponents: function(req, res) {
        let filter = {
            where: {
                product: req.body.product,
                deleted: false
            }
        };
        // id unidades asignadas y que no hallan sido eliminadas
        ProductActiveComponent.find(filter).populateAll()
            .then(components => {
                    return res.send({
                        ok: true,
                        msg: 'componentes activos del producto encontrados',
                        obj: {
                            productActiveComponents: components
                        }
                    });
                },
                err => {
                    sails.log.warn('getProductActiveComponents err', err);
                    return res.send({
                        ok: false,
                        msg: 'error al buscar componentes activos del producto',
                        obj: err
                    });
                });
    }
};