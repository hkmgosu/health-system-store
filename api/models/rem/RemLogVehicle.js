/**
 * RemLogVehicle.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        rem: {
            model: 'rem',
            required: true,
            index: true
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        vehicle: {
            model: 'vehicle'
        },
        oldVehicle: {
            model: 'vehicle'
        },
        remVehicle: {
            model: 'remvehicle'
        },
        status: {
            model: 'vehiclestatus'
        },
        position: 'json',
        type: {
            type: 'string',
            enum: ['vehicleCreated', 'vehicleEdited', 'vehicleRemoved', 'vehicleStatusChanged']
        },
        duration: 'integer',
        timeFromRemCreate: 'integer',
        timeFromRemVehicleCreate: 'integer',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    afterCreate: (log, cb) => {
        var moment = require('moment');
        async.parallel({
            remLogVehicle: cb => RemLogVehicle.findOne(log.id)
                .populate('vehicle')
                .populate('status')
                .populate('createdBy')
                .exec(cb),
            prevRemLogVehicle: cb => RemLogVehicle.findOne({ remVehicle: log.remVehicle, type: 'vehicleStatusChanged', id: { '!': log.id } }).sort('id DESC').exec(cb),
            remVehicle: cb => RemVehicle.findOne(log.remVehicle)
                .populate('establishment')
                .populate('deliveryEstablishment')
                .populate('status')
                .populate('vehicle')
                .exec(cb),
            rem: cb => Rem.findOne(log.rem).exec(cb),
            participantList: cb => ParticipantService.getList({
                remVehicle: log.remVehicle,
                deleted: false
            }).then(
                participantList => cb(null, participantList),
                cb
            )
        }, (err, results) => {

            let { rem, remLogVehicle, prevRemLogVehicle, remVehicle, participantList } = results;

            // Envío de mensaje vía sockets para actualización de vista
            Rem.message(remLogVehicle.rem, {
                message: 'remLogVehicle',
                data: {
                    log: remLogVehicle,
                    remVehicle: Object.assign(remVehicle, { participantList: participantList })
                }
            });

            // Si es un cambio de estado se debe obtener el tiempo total desde la creación del incidente y parcial desde el estado anterior
            if (remLogVehicle.type === 'vehicleStatusChanged') {

                if (prevRemLogVehicle) {
                    // Cálculo de tiempo desde el estado anterior
                    prevRemLogVehicle.duration = moment(remLogVehicle.createdAt).diff(moment(prevRemLogVehicle.createdAt), 'seconds');
                    prevRemLogVehicle.save(() => { });
                }
                // Cálculo de tiempo desde el ingreso del incidente
                remLogVehicle.timeFromRemCreate = moment(remLogVehicle.createdAt).diff(moment(rem.createdAt), 'seconds');
                // Cálculo de tiempo desde el ingreso del despacho
                remLogVehicle.timeFromRemVehicleCreate = moment(remLogVehicle.createdAt).diff(moment(remVehicle.createdAt), 'seconds');

                // Guardar
                remLogVehicle.save(() => { });
            }
        });

        // Next
        cb();
    }
};