/**
 * Storage/CostCenterController
 *
 * @description :: Server-side logic for managing Storage/costcenter
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * obtiene todos los datos
     * @param {*} req 
     * @param {*} res 
     */
    getAll(req, res) {
        // si es con paginacion
        if (req.body.page && req.body.limit) {
            return this.getPaginate(req, res);
        }

        // si consulta sin paginacion
        let filter = {
            where: {
                deleted: false
            },
            sort: 'description'
        };
        if (req.body.filter) filter.where.description = {
            'contains': req.body.filter
        };

        CostCenter.find(filter).exec((err, costCenters) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: {
                    costCenters
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
        let filter = {
            where: {
                deleted: false
            },
            sort: 'description'
        };
        if (req.body.filter) {
            filter.where.description = {
                'contains': req.body.filter
            };
        }

        let paginate = {
            page: req.body.page || 1,
            limit: req.body.limit
        };

        async.parallel({
            found: cb => {
                CostCenter.count(filter).exec(cb);
            },
            costCenters: cb => {
                CostCenter.find(filter).paginate(paginate).exec(cb);
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
        let promise = CostCenter.findOne({
            id: parseInt(req.body.id),
            deleted: false
        });
        promise.exec((err, costCenter) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!costCenter) {
                return res.send({
                    ok: false,
                    msg: 'COST_CENTER.SEARCH.NOT_FOUND',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'COST_CENTER.SEARCH.FOUND',
                obj: {
                    costCenter: costCenter
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
        CostCenter.create(req.body.costCenter).then(
            costCenter => res.send({
                ok: true,
                msg: `Centro de Costo ${costCenter.description} creado`,
                obj: {
                    costCenter: costCenter
                }
            }),
            err => res.send({
                ok: false,
                obj: err
            })
        );
    },

    /**
     * actualiza un registro por id y retorna sus datos
     * @param {*} req 
     * @param {*} res 
     */
    update(req, res) {
        CostCenter.update({
                id: req.body.costCenter.id,
                deleted: false
            }, req.body.costCenter)
            .then(
                costCenters => res.send({
                    ok: true,
                    msg: `Centro de Costo: ${costCenters[0].description} modificado`,
                    obj: {
                        costCenter: costCenters[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    },

    /**
     * elimina un registro por id, retorna los datos anteriores
     * @param {*} req 
     * @param {*} res 
     */
    delete(req, res) {
        CostCenter.update({
                id: req.body.id,
                deleted: false
            }, {
                deleted: true
            })
            .then(
                costCenters => res.send({
                    ok: true,
                    msg: `Centro de Costo: ${costCenters[0].description} eliminado`,
                    obj: {
                        costCenter: costCenters[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    }
};