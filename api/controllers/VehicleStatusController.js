/**
 * VehicleStatusController
 *
 * @description :: Server-side logic for managing vehiclestatus
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    /**
     * Inicia valores de los estados de vehículos
     */
    init: function (req, res) {
        var status = [
            { id: 1, name: 'No disponible', type: 'nodisponible', order: -1 },
            { id: 2, name: 'Disponible', type: 'disponible', order: -1 },
            { id: 3, name: 'Despachado', type: 'ensalida', order: 2 },
            { id: 4, name: 'En salida', type: 'ensalida', order: 3 },
            { id: 5, name: 'En el lugar', type: 'ensalida', order: 4 },
            { id: 6, name: 'En traslado', type: 'ensalida', order: 5 },
            { id: 7, name: 'Vuelta hacia base', type: 'ensalida', order: 9 },
            { id: 8, name: 'Finalizada', type: 'salidafinalizada', order: -1 },
            { id: 9, name: 'Camilla retenida', type: 'ensalida', order: 8 },
            { id: 10, name: 'Agregado', type: 'ensalida', order: 1 },
            { id: 11, name: 'Llegada a CA', type: 'ensalida', order: 6 },
            { id: 12, name: 'Recepción de PAC', type: 'ensalida', order: 7 },
            { id: 13, name: 'Llegada a base', type: 'ensalida', order: 10 }
        ];
        VehicleStatus.destroy({}).exec(function (err) {
            if (err) {
                return res.send({ ok: false, msg: 'VEHICLE.ERROR.DESTROY' });
            } else {
                VehicleStatus.create(status).exec(function (err, data) {
                    if (err) {
                        return res.send({ ok: false, msg: 'VEHICLE.ERROR.CREATE', obj: err });
                    } else {
                        return res.send({ ok: true, msg: 'VEHICLE.SUCCESS.SAVE', obj: { status: data } });
                    }
                });
            }
        });
    },
    /**
     * Obtiene todos los estados de vehículos
     */
    getAll: function (req, res) {
        let types = req.body.types || [];
        VehicleStatus
            .find({
                type: types,
                deleted: false
            })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'VEHICLE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'VEHICLE.SEARCH.FOUND', obj: data });
                }
            });
    }
};

