/**
 * Storage/UnitProductRequestController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * retorna todas las relaciones de empleado - unidad bodega
     * @param {*} req 
     * @param {*} res 
     */
    getAll(req, res) {
        let criteria = {};
        criteria.where = req.body.where || {};
        criteria.where.deleted = false;

        UnitProductRequest.find(criteria)
            .populate('unit')
            .populate('employee')
            .then(unitProductRequests => res.send({
                ok: true,
                msg: 'Bodegas del empleado',
                obj: {
                    unitProductRequests
                }
            })).catch(err => res.send({
                ok: false,
                msg: 'Error al buscar bodegas del empleado',
                obj: err
            }));
    },

    /**
     * crea registro de empleado - bodega
     * @param {*} req 
     * @param {*} res 
     */
    create(req, res) {
        UnitProductRequest.create(req.body.unitProductRequest)
            .then(record => UnitProductRequest.findOne(record.id).populate('unit'))
            .then(unitProductRequest => res.send({
                ok: true,
                msg: 'Bodega asociada al empleado',
                obj: {
                    unitProductRequest
                }
            })).catch(err => res.send({
                ok: false,
                msg: 'Error al asociar bodega al empleado',
                obj: err
            }));
    },

    /**
     * elimina el registro empleado - bodega
     * @param {*} req 
     * @param {*} res 
     */
    delete(req, res) {
        UnitProductRequest.destroy(req.body.id)
            .then(() => res.send({
                ok: true,
                msg: 'Bodega quitada al empleado'
            })).catch(err => res.send({
                ok: false,
                msg: 'Error al quitar bodega al empleado',
                obj: err
            }));
    }
};