/**
 * Storage/ProductRequestStatusController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
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
            sort: 'id'
        };
        if (req.body.filter) filter.where.description = {
            'contains': req.body.filter
        };

        ProductRequestStatus.find(filter).exec((err, productRequestStatuses) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: {
                    productRequestStatuses
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
            sort: 'id'
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
                ProductRequestStatus.count(filter).exec(cb);
            },
            productRequestStatuses: cb => {
                ProductRequestStatus.find(filter).paginate(paginate).exec(cb);
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
        let promise = ProductRequestStatus.findOne({
            id: parseInt(req.body.id),
            deleted: false
        });
        promise.exec((err, productRequestStatus) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!productRequestStatus) {
                return res.send({
                    ok: false,
                    msg: 'PRODUCT_REQUEST_STATUS.SEARCH.NOT_FOUND',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'PRODUCT_REQUEST_STATUS.SEARCH.FOUND',
                obj: {
                    productRequestStatus
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
        ProductRequestStatus.create(req.body.productRequestStatus).then(
            productRequestStatus => res.send({
                ok: true,
                msg: `Estado ${productRequestStatus.description} creado!`,
                obj: {
                    productRequestStatus
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
        ProductRequestStatus.update({
                id: req.body.productRequestStatus.id,
                deleted: false
            }, req.body.productRequestStatus)
            .then(
                productRequestStatus => res.send({
                    ok: true,
                    msg: `Estado: ${productRequestStatus[0].description} modificado!`,
                    obj: {
                        productRequestStatus: productRequestStatus[0]
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
        ProductRequestStatus.update({
                id: req.body.id,
                deleted: false
            }, {
                deleted: true
            })
            .then(
                productRequestStatus => res.send({
                    ok: true,
                    msg: `Estado: ${productRequestStatus[0].description} eliminado!`,
                    obj: {
                        productRequestStatus: productRequestStatus[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    }
};