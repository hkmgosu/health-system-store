/**
 * Storage/PlanCenabastController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    get(req, res) {
        req.body.id || res.send({
            ok: false,
            msg: "error: debe especificar id del inventario"
        });

        let inventoryTmpState = {
            inventory: null,
            detail: null
        }
        Inventory.findOne(req.body.id).populate('unit').populate('detail').then(inventory => {
            if (!inventory) res.send({
                ok: true,
                msg: "producto no encontrado",
                obj: inventory
            });
            inventoryTmpState.inventory = inventory
            return InventoryDetail.find({
                inventory: inventory.id
            }).populateAll();
        }, err => Promise.reject(err)).then(detail => {
            inventoryTmpState.detail = detail;
            return res.send({
                ok: true,
                msg: "inventario encontrado",
                obj: inventoryTmpState
            });
        }).catch(err => {
            sails.log.warn("error, no se pudo crear inventario: ", err);
            res.send({
                ok: false,
                msg: "no se pudo buscar inventario",
                obj: err
            });
        })
    },


    getAll(req, res) {

        let criteria = {};
        criteria.where = {};
        criteria.where.deleted = false;
        let paginate = req.body.limit && req.body.page ? {
            page: req.body.page,
            limit: req.body.limit
        } : null;

        StorageManager.find({
            employee: req.session.employee.id,
            unit: req.body.where.units
        }).populate('unit', {
            deleted: false,
            storage: true
        }).then(managers => {
            let units = req.body.where.units || _.map(_.map(managers, 'unit'), 'id');
            criteria.where.unit = units;
            criteria.sort = "createdAt DESC";
            sails.log.info("begin", criteria);
            return Promise.all([
                Inventory.count(criteria),
                paginate ? Inventory.find(criteria).populate('unit').populate('detail').paginate(paginate) : Inventory.find(criteria).populate('unit').populate('detail')
            ]);
        }).then(results => {
            sails.log.info("inventories", results[1].length);
            return res.send({
                ok: true,
                msg: "inventarios encontrados",
                obj: {
                    found: results[0],
                    inventories: results[1]
                }
            });
        }).catch(err => {
            sails.log.warn("error inventario: " + err);
            res.send({
                ok: false,
                msg: "error al buscar invenarios"
            });
        });
    },

    create(req, res) {

        let inventoryState = {
            stocks: null,
            inventory: null,
            detail: null
        }

        ProductStock.find({
                deleted: false,
                unit: req.body.inventory.unit
            })
            .then(stocks => {

                if (stocks.length === 0) return res.send({
                    ok: false,
                    msg: "Unidad sin productos para inventario de stock"
                });

                inventoryState.stocks = stocks;
                return Inventory.create(req.body.inventory);
            })
            .then(inventory => {
                inventoryState.inventory = inventory;
                let inventoryDetailCreatePromises = [];
                inventoryState.detail = [];
                sails.log.info("productStocks ", inventoryState.stocks.length);
                // get random products id from product stock
                if (req.body.inventory.randomQuantity) {
                    sails.log.info("begins random");
                    let products = _.uniq(_.map(inventoryState.stocks, 'product'));
                    sails.log.info("products", products);
                    let randomProducts = [];
                    for (let i = 0; i < req.body.inventory.randomQuantity; i++) {
                        let randomProduct = products[_.random(0, products.length - 1)];
                        sails.log.info("random Product to push: ", randomProduct)
                        randomProducts.push(randomProduct);
                        products = _.without(products, randomProduct);
                        sails.log.info("products without", products);
                    }
                    sails.log.info("randomProducts ", randomProducts);
                    sails.log.info("being filtered");
                    let filteredProductStocks = [];
                    inventoryState.stocks.forEach(stock => {
                        sails.log.info("stock product ", stock.product);
                        randomProducts.forEach(random => {
                            if (random === stock.product) {
                                sails.log.info("found ", stock.product);
                                filteredProductStocks.push(stock);
                                randomProducts = _.without(randomProducts, random);
                            }
                        });
                    });
                    inventoryState.stocks = filteredProductStocks;
                    sails.log.info("productStocks filtered", inventoryState.stocks.length);
                }

                // ACUMULAR STOCK POR PRODUCTO
                let totalStock = []
                inventoryState.stocks.forEach(stockByLotItem => {
                    let totalExist = _.find(totalStock, {
                        'product': stockByLotItem.product
                    });
                    totalExist ?
                        totalExist.stock = parseInt(totalExist.stock) + parseInt(stockByLotItem.stock) :
                        totalStock.push({
                            inventory: stockByLotItem.inventory,
                            product: stockByLotItem.product,
                            id: stockByLotItem.id,
                            stock: stockByLotItem.stock
                        });
                });

                // SE ASIGNA Y SE DEVUELVE FORMATEADO
                inventoryState.stocks = totalStock;

                inventoryState.stocks.forEach(actualStockInfo => {
                    let detailObj = {
                        inventory: inventoryState.inventory.id,
                        product: actualStockInfo.product,
                        productStock: actualStockInfo.id,
                        softwareStock: actualStockInfo.stock
                    };
                    inventoryState.detail.push(detailObj);
                    inventoryDetailCreatePromises.push(InventoryDetail.create(detailObj));
                });
                return Promise.all(inventoryDetailCreatePromises);
            }, err => {
                Inventory.destroy({
                    id: inventoryState.inventory.id
                });
                InventoryDetail.destroy({
                    inventory: inventoryState.inventory
                });
                return res.send({
                    ok: false,
                    msg: 'no se pudo crear el detalle del inventario',
                    obj: err
                })
            })
            .then(inventoryDetailCreated => Inventory.findOne(inventoryState.inventory.id).populate('unit').populate('detail'), err => Promise.reject(err))
            .then(inventory => res.send({
                ok: true,
                msg: 'inventario creado',
                obj: {
                    inventory
                }
            }), err => {
                sails.log.warn("error: ", err);
                return res.send({
                    ok: false,
                    msg: "error al crear inventario",
                    obj: {
                        err
                    }
                })
            }).catch(err => {
                Inventory.destroy({
                    id: inventoryState.inventory.id
                });
                InventoryDetail.destroy({
                    inventory: inventoryState.inventory
                });
                return res.send({
                    ok: false,
                    msg: 'no se pudo crear el detalle del inventario',
                    obj: err
                })
            });
    },

    update(req, res) {
        Inventory.update({
            id: req.body.inventory.id
        }, req.body.inventory).then(updated => res.send({
            ok: true,
            msg: "Inventario actualizado",
            obj: {
                inventory: updated[0]
            }
        }), err => res.send({
            ok: false,
            msg: "error al actualizar inventario",
            obj: err
        }));
    },

    delete(req, res) {
        Inventory.update(req.body.id, {
                deleted: true
            })
            .then(records => res.send({
                ok: true,
                msg: 'Inventario eliminado',
                obj: {}
            })).catch(err => res.send({
                ok: false,
                msg: 'Error al eliminar Inventario',
                obj: err
            }));
    },

    updateInventoryDetail(req, res) {
        InventoryDetail.update({
            id: req.body.inventoryDetail.id
        }, req.body.inventoryDetail).then(detailUpdated => res.send({
            ok: true,
            msg: "detalle actualizado",
            obj: detailUpdated[0]
        }), err => res.send({
            ok: false,
            msg: "no se pudo actualizar detalle del inventario",
            obj: err
        }));
    }

};