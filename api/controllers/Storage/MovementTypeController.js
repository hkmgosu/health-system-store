/**
 * Storage/MovementTypeController
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
        let querys = {};

        let where = req.body.where ? req.body.where : {};
        where.deleted = false;

        let criteria = {};
        criteria.where = where;
        criteria.sort = 'description ASC';

        if (req.body.page && req.body.limit) {
            querys.found = cb => MovementType.count(criteria.where).exec(cb);
            querys.movementTypes = cb => MovementType.find(criteria)
                .paginate({
                    page: req.body.page,
                    limit: req.body.limit
                })
                .exec(cb);
        } else {
            querys.movementTypes = cb => MovementType.find(criteria)
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
     * obtiene un registro por id
     * @param {*} req 
     * @param {*} res 
     */
    get(req, res) {
        let promise = MovementType.findOne({
            id: parseInt(req.body.id),
            deleted: false
        });
        promise.exec((err, movementType) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!movementType) {
                return res.send({
                    ok: false,
                    msg: 'MOVEMENT_TYPE.SEARCH.NOT_FOUND',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'MOVEMENT_TYPE.SEARCH.FOUND',
                obj: {
                    movementType: movementType
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
        MovementType.create(req.body.movementType).then(
            movementType => res.send({
                ok: true,
                msg: `Tipo de movimiento ${movementType.description} creado!`,
                obj: {
                    movementType: movementType
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
        MovementType.update({
                id: req.body.movementType.id,
                deleted: false
            }, req.body.movementType)
            .then(
                movementTypes => res.send({
                    ok: true,
                    msg: `Tipo de movimiento: ${movementTypes[0].description} modificado!`,
                    obj: {
                        movementType: movementTypes[0]
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
        MovementType.update({
                id: req.body.id,
                deleted: false
            }, {
                deleted: true
            })
            .then(
                movementTypes => res.send({
                    ok: true,
                    msg: `Tipo de movimiento: ${movementTypes[0].description} eliminado!`,
                    obj: {
                        movementType: movementTypes[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    }
};