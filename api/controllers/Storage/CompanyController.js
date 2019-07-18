/**
 * Storage/CompanyController
 *
 * @name :: Server-side logic for managing Storage/presentationtypes
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
            sort: 'name'
        };
        if (req.body.filter) filter.where.or = [{
                name: {
                    'contains': req.body.filter
                }
            },
            {
                rut: {
                    'contains': req.body.filter
                }
            }
        ];

        Company.find(filter).exec((err, companies) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: {
                    companies
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
            sort: 'name'
        };
        if (req.body.filter) {
            filter.where.or = [{
                    name: {
                        'contains': req.body.filter
                    }
                },
                {
                    rut: {
                        'contains': req.body.filter
                    }
                }
            ];
        }

        let paginate = {
            page: req.body.page || 1,
            limit: req.body.limit
        };

        async.parallel({
            found: cb => {
                Company.count(filter).exec(cb);
            },
            companies: cb => {
                Company.find(filter).paginate(paginate).exec(cb);
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
        let promise = Company.findOne({
            id: parseInt(req.body.id),
            deleted: false
        });
        promise.exec((err, company) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!company) {
                return res.send({
                    ok: false,
                    msg: 'COMPANY.SEARCH.NOT_FOUND',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'COMPANY.SEARCH.FOUND',
                obj: {
                    company: company
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
        Company.create(req.body.company).then(
            company => res.send({
                ok: true,
                msg: `Compañía ${company.name} creada!`,
                obj: {
                    company: company
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
        Company.update({
                id: req.body.company.id,
                deleted: false
            }, req.body.company)
            .then(
                companies => res.send({
                    ok: true,
                    msg: `Compañía: ${companies[0].name} modificada!`,
                    obj: {
                        company: companies[0]
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
        Company.update({
                id: req.body.id,
                deleted: false
            }, {
                deleted: true
            })
            .then(
                companies => res.send({
                    ok: true,
                    msg: `Compañía: ${companies[0].name} eliminada!`,
                    obj: {
                        company: companies[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    }
};