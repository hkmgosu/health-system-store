/**
 * Storage/DosageTypeController
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
            sort: 'description'
        };
        if (req.body.filter) filter.where.description = {
            'contains': req.body.filter
        };

        DosageType.find(filter).exec((err, dosageTypes) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: {
                    dosageTypes
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
            found: cb => DosageType.count(filter).exec(cb),
            dosageTypes: cb => DosageType.find(filter).paginate(paginate).exec(cb)
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
        let promise = DosageType.findOne({
            id: parseInt(req.body.id),
            deleted: false
        });
        promise.exec((err, dosageType) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!dosageType) {
                return res.send({
                    ok: false,
                    msg: 'DOSAGE_TYPE.SEARCH.NOT_FOUND',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'DOSAGE_TYPE.SEARCH.FOUND',
                obj: {
                    dosageType: dosageType
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
        DosageType.create(req.body.dosageType).then(
            dosageType => res.send({
                ok: true,
                msg: `Tipo de dosificación ${dosageType.description} creada!`,
                obj: {
                    dosageType: dosageType
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
        DosageType.update({
                id: req.body.dosageType.id,
                deleted: false
            }, req.body.dosageType)
            .then(
                dosageTypes => res.send({
                    ok: true,
                    msg: `Tipo de dosificación: ${dosageTypes[0].description} modificada!`,
                    obj: {
                        dosageType: dosageTypes[0]
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
        DosageType.update({
                id: req.body.id,
                deleted: false
            }, {
                deleted: true
            })
            .then(
                dosageTypes => res.send({
                    ok: true,
                    msg: `Tipo de dosificación: ${dosageTypes[0].description} eliminada!`,
                    obj: {
                        dosageType: dosageTypes[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    }
};