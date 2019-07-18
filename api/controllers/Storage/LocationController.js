/**
 * Storage/LocationController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * retorna la informacion de un registro
     * @param {*} req 
     * @param {*} res 
     */
    get(req, res) {
        //
    },

    /**
     * retorna listado de ubicaciones
     * @param {*} req 
     * @param {*} res 
     */
    getAll(req, res) {
        let querys = {};
        let where = req.body.where ? req.body.where : {};
        where.deleted = false;
        if (req.body.filter) where.description = {
            'contains': req.body.filter
        };

        let criteria = {};
        criteria.where = where;
        criteria.sort = 'description ASC';

        if (req.body.page && req.body.limit) {
            querys.found = Location.count(criteria.where);
            querys.locations = cb => Location.find(criteria)
                .paginate({
                    page: req.body.page,
                    limit: req.body.limit
                })
                .exec(cb);
        } else {
            querys.locations = cb => Location.find(criteria)
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
     * crea un registro de ubicacion
     * @param {*} req 
     * @param {*} res 
     */
    create(req, res) {
        Location.create(req.body.location)
            .then(location => res.send({
                ok: true,
                msg: 'Ubicación creada',
                obj: {
                    location
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al crear ubicación',
                obj: err
            }));
    },

    /**
     * actualiza el registro de ubicacion
     * @param {*} req 
     * @param {*} res 
     */
    update(req, res) {
        Location.update(req.body.location.id, req.body.location)
            .then(records => res.send({
                ok: true,
                msg: 'Ubicación modificada',
                obj: {
                    location: records[0]
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al modificar ubicación',
                obj: err
            }));
    },

    /**
     * marca como eliminado la ubicacion
     * @param {*} req 
     * @param {*} res 
     */
    delete(req, res) {
        Location.update(req.body.id, {
                deleted: true,
                id: req.body.id
            }).then(records => res.send({
                ok: true,
                msg: 'Ubicación eliminada',
                obj: {
                    location: records[0]
                }
            }))
            .catch(err => res.send({
                ok: false,
                msg: 'Error al modificar ubicación',
                obj: err
            }));
    }
};