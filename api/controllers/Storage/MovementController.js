/**
 * Storage/MovementController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * retorna el listado de movimientos
     * @param {*} req
     * @param {*} res
     */
    getAll(req, res) {
        let where = req.body.where ? req.body.where : {};
        where.deleted = false;

        if (req.body.filter) {
            where.or = [{
                    id: (parseInt(req.body.filter) || 0)
                },
                {
                    numInvoice: (parseInt(req.body.filter) || 0)
                },
                {
                    idChileCompra: {
                        contains: req.body.filter
                    }
                },
                {
                    donatedBy: {
                        contains: req.body.filter
                    }
                },
                {
                    numShippingOrder: {
                        contains: req.body.filter
                    }
                },
                {
                    numRequest: {
                        contains: req.body.filter
                    }
                }
            ];
        }
        let criteria = {};
        criteria.where = where;
        criteria.sort = 'createdAt DESC';

        let querys = {};
        querys.movementTypes = cb => MovementType.find().exec(cb);
        // sails.log.info(JSON.stringify(criteria));

        if (req.body.page && req.body.limit) {
            querys.found = cb => Movement.count(criteria.where).exec(cb);
            querys.movements = cb => Movement.find(criteria)
                .populate('unit')
                .populate('destinyUnit')
                .populate('createdBy')
                .paginate({
                    page: req.body.page,
                    limit: req.body.limit
                })
                .exec(cb);
        } else {
            querys.movements = cb => Movement.find(criteria)
                .populate('unit')
                .populate('destinyUnit')
                .populate('createdBy')
                .exec(cb);
        }

        // ejecutar las consultas en paralelo y retornarla
        async.parallel(querys, (err, obj) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });

            let movementType = _.indexBy(obj.movementTypes, "id");
            let resumen = {};
            resumen.movements = [];
            if (typeof(obj.found) !== 'undefined') resumen.found = obj.found;

            obj.movements.forEach(movement => {
                let item = Object.assign({}, movement);
                item.movementType = movementType[item.movementType];
                resumen.movements.push(item);
            });

            return res.send({
                ok: true,
                obj: resumen
            });
        });
    },


    /**
     * retorna la informacion de un movimiento y su detalle
     * @param {*} req
     * @param {*} res
     */
    get(req, res) {
        let result = {};
        let criteria = {
            deleted: false,
            id: req.body.id
        };
        Movement.findOne(criteria)
            .populate('unit')
            .populate('destinyUnit')
            .populate('movementType')
            .populate('company')
            .populate('createdBy')
            .then(movement => {
                result = Object.assign({}, movement);
                return MovementDetail.find({
                    deleted: false,
                    movement: movement.id
                }).populate('product').populate('subprogram');
            })
            .then(details => {
                result.details = details;
                res.send({
                    ok: true,
                    msg: 'Movimiento encontrado',
                    obj: {
                        movement: result
                    }
                });
            })
            .catch(err => res.send({
                ok: false,
                msg: 'Error al consultar detalle de movimiento',
                obj: err
            }));
    },

    /**
     * crea un registro de movimiento y retorna lo creado
     * @param {*} req
     * @param {*} res
     */
    create(req, res) {
        let controller = this;
        let data = req.body.movement;
        if (data.unit.id) data.unit = data.unit.id;
        if (data.movementType.id) data.movementType = data.movementType.id;
        if (data.destinyUnit && data.destinyUnit.id) data.destinyUnit = data.destinyUnit.id;
        data.createdBy = req.session.employee.id;

        let movement = {};

        // crear el registro de movimiento
        Movement.create(data)
            .then(record => movement = record)
            .then(() => controller.updateFromChileCompra(null, movement))
            .then(() => Movement.findOne(movement.id)
                .populate('unit')
                .populate('destinyUnit')
                .populate('movementType')
                .populate('createdBy'))
            .then(record => movement = record)
            .then(() => {
                Movement.message(req.session.employee.id, {
                    message: 'movement:new-movement',
                    data: movement
                });
                res.send({
                    ok: true,
                    msg: 'Movimiento creado sin problema',
                    obj: {
                        movement
                    }
                });
            }).catch(err => res.send({
                ok: false,
                msg: 'Error al crear movimiento',
                obj: err
            }));
    },


    update(req, res) {
        let controller = this;
        let old = {};
        let movement = {};

        Movement.findOne(req.body.movement.id)
            .then(record => {
                if (!record) return res.send({
                    ok: false,
                    msg: 'Movimiento no encontrado.',
                    obj: null
                });
                old = record;
            })
            .then(() => Movement.update({
                id: req.body.movement.id,
                deleted: false
            }, req.body.movement))
            .then(records => controller.updateFromChileCompra(old, req.body.movement))
            .then(() => Movement.findOne(req.body.movement.id))
            .then(record => movement = Object.assign({}, record))
            .then(() => MovementDetail.find({
                movement: movement.id,
                deleted: false
            }).populate('product'))
            .then(details => {
                movement.details = details;
                res.send({
                    ok: true,
                    msg: 'Movimiento actualizado',
                    obj: {
                        movement
                    }
                });
            })
            .catch(err => res.send({
                ok: false,
                msg: 'Error al actualizar el movimiento',
                obj: err
            }));
    },


    /**
     * marca como eliminado la informacion del movimiento y su detalle
     * @param {*} req
     * @param {*} res
     */
    delete(req, res) {
        Promise.all([
            // marcar eliminado el detalle del movimiento
            MovementDetail.update({
                movement: req.body.id
            }, {
                deleted: true
            }),
            // marcar eliminado el movimiento
            Movement.update({
                id: req.body.id
            }, {
                deleted: true
            })
        ]).then(results => {
            let movement = results[1];
            movement.details = results[0];
            res.send({
                ok: true,
                msg: 'Movimiento eliminado',
                obj: {
                    movement
                }
            });
        }).catch(err => res.send({
            ok: false,
            msg: 'Error al eliminar movimiento',
            obj: err
        }));
    },



    updateFromChileCompra(old, record) {
        if (!record.movementType || record.movementType != 1 || !record.idChileCompra) {
            return null;
        }
        if (old && old.idChileCompra == record.idChileCompra) {
            return null;
        }

        sails.log.info('updateFromChileCompra: update');

        // rescatar datos de api de chilecompras
        let ticket = "98D238A3-B18C-4B3E-80F3-82E8E102DA59";
        let url = "http://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json" +
            "?ticket=" + ticket +
            "&codigo=" + record.idChileCompra;

        let request = require('request');
        request.get(url, (err, res, body) => {
            if (err) return record;
            let data = JSON.parse(body);
            if (!data.Listado || !data.Listado.length) return record;

            // eliminar el detalle anterior
            MovementDetail.destroy({
                    movement: record.id
                })
                .then(() => {
                    // creo el detalle de la orden de compra
                    let total = 0;
                    for (let i = 0; i < data.Listado[0].Items.Listado.length; ++i) {
                        let item = data.Listado[0].Items.Listado[i];
                        total += Number(item.Total || 0);

                        MovementDetail.create({
                                movement: record.id,
                                quantity: item.Cantidad,
                                productCode: item.CodigoProducto,
                                productDescription: item.Producto,
                                priceItem: Number(item.Total || 0)
                            }).then(() => {})
                            .catch(err => sails.log.error(err));
                    }

                    // actualizo la fecha de la orden de compra
                    Movement.update(record.id, {
                        id: record.id,
                        idChileCompra: record.idChileCompra,
                        datePurchaseOrder: data.Listado[0].Fechas.FechaAceptacion,
                        priceTotal: total
                    }).then(() => {}).catch(err => sails.log.error(err));
                })
                .catch(err => sails.log.error(err));
        });
    },



    unsubscribe(req, res) {
        Movement.unsubscribe(req, req.session.employee.id);
    },


    /**
     * retorna la informacion de un detalle de movimiento
     * @param {*} req
     * @param {*} res
     */
    getDetail(req, res) {
        MovementDetail.findOne({
                deleted: false,
                id: req.body.id
            }).populate('product')
            .then(movementDetail => {
                if (!movementDetail) return res.send({
                    ok: false,
                    msg: 'Detalle no encontrado',
                    obj: {}
                });

                res.send({
                    ok: true,
                    msg: 'Detalle encontrado',
                    obj: {
                        movementDetail
                    }
                });
            }).catch(err => res.send({
                ok: false,
                msg: 'Error al consultar detalle movimiento',
                obj: err
            }));
    },


    addDetail(req, res) {
        let movementDetail = {};

        Movement.findOne(req.body.movementDetail.movement).populate('movementType')
            .then(movement => {
                req.body.movementDetail.quantity = Math.abs(req.body.movementDetail.quantity);
                if (movement.isOutput) {
                    req.body.movementDetail.quantity = req.body.movementDetail.quantity * -1;
                }
                return MovementDetail.create(req.body.movementDetail);
            })
            .then(record => MovementDetail.findOne(record.id)
                .populate('product').populate('subprogram'))
            .then(record => movementDetail = record)
            .then(() => res.send({
                ok: true,
                msg: 'Se ha creado el detalle del movimiento',
                obj: {
                    movementDetail
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al crear detalle del movimiento',
                obj: err
            }));
    },

    delDetail(req, res) {
        let movementDetail = {};

        MovementDetail.findOne(req.body.id)
            .then(record => movementDetail = record)
            .then(() => MovementDetail.destroy(req.body.id))
            .then(() => res.send({
                ok: true,
                msg: 'Se ha eliminado el detalle del movimiento',
                obj: {
                    movementDetail
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al crear detalle del movimiento',
                obj: err
            }));
    },

    saveDetail(req, res) {
        let movementDetail = {};

        Movement.findOne(req.body.movementDetail.movement).populate('movementType')
            .then(movement => {
                req.body.movementDetail.quantity = Math.abs(req.body.movementDetail.quantity);
                if (movement.isOutput) {
                    req.body.movementDetail.quantity = req.body.movementDetail.quantity * -1;
                }
                return MovementDetail.update(req.body.movementDetail.id, req.body.movementDetail);
            })
            .then(records => MovementDetail.findOne(records[0].id)
                .populate('product').populate('subprogram'))
            .then(record => movementDetail = record)
            .then(() => res.send({
                ok: true,
                msg: 'Se ha modificado el detalle del movimiento',
                obj: {
                    movementDetail
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al modificar detalle del movimiento',
                obj: err
            }));
    },

    /**
     * retorna un listado de unidades definidas como entidades externas
     * @param {*} req
     * @param {*} res
     */
    getExternalUnits(req, res) {
        Unit.find({
                parent: null,
                deleted: false,
                level: {
                    '!': -1
                }
            })
            .then(units => res.send({
                ok: true,
                msg: 'Unidades Encontradas',
                obj: {
                    units
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al consultar unidades',
                obj: err
            }));
    }
};