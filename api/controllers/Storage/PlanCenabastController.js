/**
 * Storage/PlanCenabastController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    get(req, res) {
        let planCenabast = {};
        PlanCenabast.findOne({
            deleted: false,
            id: req.body.id
        }).then(record => {
            if (!record) return res.send({
                ok: false,
                msg: 'Plan no existe',
                obj: {}
            });
            planCenabast = record;
            return Product.findOne(record.product)
                .populate('dosageType')
                .populate('drugType')
                .populate('productType')
                .populate('presentationType');
        }).then(product => {
            planCenabast.product = product;
            res.send({
                ok: false,
                msg: 'Plan encontrado',
                obj: {
                    planCenabast
                }
            });
        }).catch(err => res.send({
            ok: false,
            msg: 'Error al buscar plan',
            obj: err
        }))
    },

    getAll(req, res) {
        let planCenabasts = [];
        let criteria = {};
        criteria.where = req.body.where || {};
        criteria.where.deleted = false;

        let whereProduct = {};
        if (req.body.filter) {
            whereProduct.description = {
                contains: req.body.filter
            };
        }

        // sails.log.info('criteria', JSON.stringify(criteria));
        PlanCenabast.find(criteria)
            .then(records => {
                planCenabasts = records;
                whereProduct.deleted = false;
                whereProduct.id = _.pluck(records, "product");
                // sails.log.info('whereProduct', JSON.stringify(whereProduct));
                return Product.find(whereProduct)
                    .populate('drugType')
                    .populate('dosageType')
                    .populate('productType')
                    .populate('presentationType');
            }).then(products => {
                let oProduct = _.indexBy(products, "id");
                // sails.log.info('oProduct', JSON.stringify(oProduct));

                for (let i = 0; i < planCenabasts.length; ++i) {
                    planCenabasts[i].product = oProduct[planCenabasts[i].product] || {};
                }
                if (req.body.filter) {
                    // quitar registros de productos no encontrados
                    for (let i = planCenabasts.length - 1; i >= 0; --i) {
                        if (!planCenabasts[i].product.id) {
                            planCenabasts.splice(i, 1);
                        }
                    }
                }
                res.send({
                    ok: true,
                    msg: 'Planificación de Cenabast encontrado',
                    obj: {
                        planCenabasts
                    }
                });
            }).catch(err => res.send({
                ok: false,
                msg: 'Error al consulta planificación de Cenabast',
                obj: err
            }));
    },

    create(req, res) {
        let planCenabast = {};
        PlanCenabast.findOne({
            year: req.body.planCenabast.year,
            month: req.body.planCenabast.month,
            product: req.body.planCenabast.product,
            deleted: true
        }).then(record => {
            if (record) {
                // si fue eliminado anteriormente, lo reactivo
                req.body.planCenabast.deleted = false;
                return PlanCenabast.update(record.id, req.body.planCenabast)
                    .then(records => records[0]);
            } else {
                // creo el registro
                return PlanCenabast.create(req.body.planCenabast);
            }
        }).then(record => {
            planCenabast = record;
            return Product.findOne(record.product)
                .populate('dosageType')
                .populate('drugType')
                .populate('productType')
                .populate('presentationType');
        }).then(product => {
            planCenabast.product = product;
            res.send({
                ok: true,
                msg: 'Producto agregado al plan',
                obj: {
                    planCenabast
                }
            });
        }).catch(err => res.send({
            ok: false,
            msg: 'Error al agregar producto a plan',
            obj: err
        }));
    },

    update(req, res) {
        let planCenabast = {};
        PlanCenabast.update(req.body.planCenabast.id, req.body.planCenabast)
            .then(records => {
                planCenabast = records[0];
                return Product.findOne(planCenabast.product)
                    .populate('dosageType')
                    .populate('drugType')
                    .populate('productType')
                    .populate('presentationType');
            }).then(product => {
                planCenabast.product = product;
                res.send({
                    ok: true,
                    msg: 'Producto modificado en el plan',
                    obj: {
                        planCenabast
                    }
                });
            }).catch(err => res.send({
                ok: false,
                msg: 'Error al modificar producto en el plan',
                obj: err
            }));
    },

    delete(req, res) {
        PlanCenabast.update(req.body.id, {
                deleted: true
            })
            .then(records => res.send({
                ok: true,
                msg: 'Producto eliminado del plan',
                obj: {}
            })).catch(err => res.send({
                ok: false,
                msg: 'Error al eliminar producto del plan',
                obj: err
            }));
    }
};