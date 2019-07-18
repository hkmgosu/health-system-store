/**
 * Storage/ExpressIncomeController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * retorna el listado de ingreso expresss
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
                    requestBy: {
                        contains: req.body.filter
                    }
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
                    requestBy: {
                        contains: req.body.filter
                    }
                },
                {
                    numShippingOrder: {
                        contains: req.body.filter
                    }
                }
            ];
        }
        let criteria = {};
        criteria.where = where;
        criteria.sort = 'createdAt DESC';

        let querys = {};

        if (req.body.page && req.body.limit) {
            querys.found = cb => ExpressIncome.count(criteria.where).exec(cb);
            querys.expressIncomeses = cb => ExpressIncome.find(criteria)
                .populate('destinyUnit')
                .populate('createdBy')
                .paginate({
                    page: req.body.page,
                    limit: req.body.limit
                })
                .exec(cb);
        } else {
            querys.expressIncomeses = cb => ExpressIncome.find(criteria)
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

            return res.send({
                ok: true,
                obj
            });
        });
    },


    /**
     * retorna la informacion de un ingreso express y su detalle
     * @param {*} req 
     * @param {*} res 
     */
    get(req, res) {
        let result = {};
        let criteria = {
            deleted: false,
            id: req.body.id
        };
        ExpressIncome.findOne(criteria)
            .populate('destinyUnit').populate('createdBy')
            .then(expressIncome => {
                result = Object.assign({}, expressIncome);
                return ExpressIncomeDetail.find({
                    deleted: false,
                    expressIncome: expressIncome.id
                }).populate('product');
            })
            .then(details => {
                result.details = details || [];
                res.send({
                    ok: true,
                    msg: 'Ingreso Express encontrado',
                    obj: {
                        expressIncome: result
                    }
                });
            })
            .catch(err => res.send({
                ok: false,
                msg: 'Error al consultar detalle del consumo',
                obj: err
            }));
    },

    /**
     * crea un registro de ingreso express y retorna lo creado
     * @param {*} req 
     * @param {*} res 
     */
    create(req, res) {
        let controller = this;
        let data = req.body.expressIncome;
        if (data.destinyUnit && data.destinyUnit.id) data.destinyUnit = data.destinyUnit.id;
        data.createdBy = req.session.employee.id;

        let expressIncome = {};

        // crear el registro de ingreso express
        ExpressIncome.create(data)
            .then(record => expressIncome = record)
            .then(() => ExpressIncome.findOne(expressIncome.id)
                .populate('destinyUnit')
                .populate('createdBy'))
            .then(record => expressIncome = record)
            .then(() => {
                ExpressIncome.message(req.session.employee.id, {
                    message: 'expressIncome:new-expressIncome',
                    data: expressIncome
                });
                res.send({
                    ok: true,
                    msg: 'Ingreso Express creado sin problema',
                    obj: {
                        expressIncome
                    }
                });
            }).catch(err => res.send({
                ok: false,
                msg: 'Error al crear ingreso express',
                obj: err
            }));
    },


    update(req, res) {
        let controller = this;
        let old = {};
        let expressIncome = {};

        ExpressIncome.findOne(req.body.expressIncome.id)
            .then(record => {
                if (!record) return res.send({
                    ok: false,
                    msg: 'Ingreso Express no encontrado.',
                    obj: null
                });
                old = record;
            })
            .then(() => ExpressIncome.update({
                id: req.body.expressIncome.id,
                deleted: false
            }, req.body.expressIncome))
            .then(() => ExpressIncome.findOne(req.body.expressIncome.id)
                .populate('destinyUnit').populate('createdBy'))
            .then(record => expressIncome = Object.assign({}, record))
            .then(() => ExpressIncomeDetail.find({
                expressIncome: expressIncome.id,
                deleted: false
            }).populate('product'))
            .then(details => {
                expressIncome.details = details;
                res.send({
                    ok: true,
                    msg: 'Ingreso Express actualizado',
                    obj: {
                        expressIncome
                    }
                });
            })
            .catch(err => res.send({
                ok: false,
                msg: 'Error al actualizar el ingreso express',
                obj: err
            }));
    },


    /**
     * marca como eliminado la informacion del ingreso express y su detalle
     * @param {*} req 
     * @param {*} res 
     */
    delete(req, res) {
        Promise.all([
            // marcar eliminado el detalle del ingreso express
            ExpressIncomeDetail.update({
                expressIncome: req.body.id
            }, {
                deleted: true
            }),
            // marcar eliminado el ingreso express
            ExpressIncome.update({
                id: req.body.id
            }, {
                deleted: true
            })
        ]).then(results => {
            let expressIncome = results[1];
            expressIncome.details = results[0];
            res.send({
                ok: true,
                msg: 'Ingreso Express eliminado',
                obj: {
                    expressIncome
                }
            });
        }).catch(err => res.send({
            ok: false,
            msg: 'Error al eliminar ingreso express',
            obj: err
        }));
    },




    unsubscribe(req, res) {
        ExpressIncome.unsubscribe(req, req.session.employee.id);
    },


    /**
     * retorna la informacion de un detalle de ingreso express
     * @param {*} req 
     * @param {*} res 
     */
    getDetail(req, res) {
        ExpressIncomeDetail.findOne({
                deleted: false,
                id: req.body.id
            }).populate('product')
            .then(expressIncomeDetail => {
                if (!expressIncomeDetail) return res.send({
                    ok: false,
                    msg: 'Detalle no encontrado',
                    obj: {}
                });

                res.send({
                    ok: true,
                    msg: 'Detalle encontrado',
                    obj: {
                        expressIncomeDetail
                    }
                });
            }).catch(err => res.send({
                ok: false,
                msg: 'Error al consultar detalle ingreso express',
                obj: err
            }));
    },


    addDetail(req, res) {
        let expressIncomeDetail = {};

        ExpressIncomeDetail.create(req.body.expressIncomeDetail)
            .then(record => ExpressIncomeDetail.findOne(record.id).populate('product'))
            .then(record => expressIncomeDetail = record)
            .then(() => res.send({
                ok: true,
                msg: 'Se ha creado el detalle del ingreso express',
                obj: {
                    expressIncomeDetail
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al crear detalle del ingreso express',
                obj: err
            }));
    },

    delDetail(req, res) {
        let expressIncomeDetail = {};

        ExpressIncomeDetail.findOne(req.body.id)
            .then(record => expressIncomeDetail = record)
            .then(() => ExpressIncomeDetail.destroy(req.body.id))
            .then(() => res.send({
                ok: true,
                msg: 'Se ha eliminado el detalle del ingreso express',
                obj: {
                    expressIncomeDetail
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al crear detalle del ingreso express',
                obj: err
            }));
    },

    saveDetail(req, res) {
        let expressIncomeDetail = {};
        ExpressIncomeDetail.update(req.body.expressIncomeDetail.id, req.body.expressIncomeDetail)
            .then(records => ExpressIncomeDetail.findOne(records[0].id)
                .populate('product'))
            .then(record => expressIncomeDetail = record)
            .then(() => res.send({
                ok: true,
                msg: 'Se ha modificado el detalle del ingreso express',
                obj: {
                    expressIncomeDetail
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al modificar detalle del ingreso express',
                obj: err
            }));
    }
};