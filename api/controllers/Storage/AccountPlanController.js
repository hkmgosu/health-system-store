/**
 * Storage/AccountPlanController
 *
 * @description :: Server-side logic for managing storage/accountplans
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
            sort: 'code'
        };
        if (req.body.filter) filter.where.description = {
            contains: req.body.filter
        };

        AccountPlan.find(filter).exec((err, accounts) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: {
                    accounts
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
            sort: 'code'
        };
        if (req.body.filter) {
            filter.where.or = [{
                    year: parseInt(req.body.filter) || 0
                },
                {
                    code: {
                        'contains': req.body.filter
                    }
                },
                {
                    description: {
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
                AccountPlan.count(filter).exec(cb);
            },
            accounts: cb => {
                AccountPlan.find(filter).paginate(paginate).exec(cb);
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
        let promise = null;

        if (typeof req.body.id !== 'undefined') {
            promise = AccountPlan.findOne({
                id: parseInt(req.body.id),
                deleted: false
            });
        } else {
            promise = AccountPlan.findOne({
                year: req.body.accountPlan.year,
                code: req.body.accountPlan.code,
                deleted: false
            });
        }

        promise.exec((err, account) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!account) {
                return res.send({
                    ok: false,
                    msg: 'Registro no encontrado',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'ACCOUNT_PLAN.SEARCH.FOUND',
                obj: {
                    accountPlan: account
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
        AccountPlan.create(req.body.accountPlan).then(
            account => res.send({
                ok: true,
                msg: `Cuenta ${account.year}-${account.code} creada!`,
                obj: {
                    accountPlan: account
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
        AccountPlan.update({
                id: req.body.accountPlan.id,
                deleted: false
            }, req.body.accountPlan)
            .then(
                accounts => res.send({
                    ok: true,
                    msg: `Cuenta ${accounts[0].year}:${accounts[0].code} modificada!`,
                    obj: {
                        accountPlan: accounts[0]
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
        AccountPlan.update({
                id: req.body.id,
                deleted: false
            }, {
                deleted: true
            })
            .then(
                accounts => res.send({
                    ok: true,
                    msg: `Cuenta ${accounts[0].year}-${accounts[0].code} eliminada!`,
                    obj: {
                        accountPlan: accounts[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    }
};