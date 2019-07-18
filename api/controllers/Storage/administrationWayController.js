/**
 * Storage/AdministrationWayController
 *
 * @description :: Server-side logic for managing Storage/administrationways
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

        AdministrationWay.find(filter).exec((err, administrationWays) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: {
                    administrationWays
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
                AdministrationWay.count(filter).exec(cb);
            },
            administrationWays: cb => {
                AdministrationWay.find(filter).paginate(paginate).exec(cb);
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
        let promise = AdministrationWay.findOne({
            id: parseInt(req.body.id),
            deleted: false
        });
        promise.exec((err, administrationWay) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!administrationWay) {
                return res.send({
                    ok: false,
                    msg: 'ADMINISTRATION_WAY.SEARCH.NOT_FOUND',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'ADMINISTRATION_WAY.SEARCH.FOUND',
                obj: {
                    administrationWay: administrationWay
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
        AdministrationWay.create(req.body.administrationWay).then(
            administrationWay => res.send({
                ok: true,
                msg: `Via de Administración ${administrationWay.description} creada`,
                obj: {
                    administrationWay: administrationWay
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
        AdministrationWay.update({
                id: req.body.administrationWay.id,
                deleted: false
            }, req.body.administrationWay)
            .then(
                administrationWays => res.send({
                    ok: true,
                    msg: `Via de Administración: ${administrationWays[0].description} modificada`,
                    obj: {
                        administrationWay: administrationWays[0]
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
        AdministrationWay.update({
                id: req.body.id,
                deleted: false
            }, {
                deleted: true
            })
            .then(
                administrationWays => res.send({
                    ok: true,
                    msg: `Via de Administración: ${administrationWays[0].description} eliminada`,
                    obj: {
                        administrationWay: administrationWays[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    }
};