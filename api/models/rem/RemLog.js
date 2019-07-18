/**
 * RemLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        description: 'string',
        rem: {
            model: 'rem',
            required: true,
            index: true
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        status: {
            model: 'remstatus'
        },
        comment: 'string',
        reason: 'string',
        type: {
            type: 'string',
            enum: ['basicInformationChanged', 'addressInformationChanged', 'statusChanged']
        },
        duration: 'integer',
        timeFromRemCreate: 'integer',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    afterCreate: (log, cb) => {
        var moment = require('moment');
        async.parallel({
            remLog: cb => RemLog.findOne(log.id).populate('createdBy').populate('status').exec(cb),
            remLogPrev: cb => {
                if (log.type !== 'statusChanged') { return async.setImmediate(cb); }
                RemLog.findOne({ rem: log.rem, type: 'statusChanged', id: { '!': log.id } }).sort('id DESC').exec(cb);
            },
            rem: cb => Rem.findOne(log.rem).populateAll().then(rem => {
                if (rem.originAddress) {
                    Address.findOne(rem.originAddress.id).populateAll().then(address => {
                        rem.originAddress = address;
                        cb(null, rem);
                    }, cb);
                } else { cb(null, rem); }
            }, cb)
        }, (err, results) => {

            let { remLog, remLogPrev, rem } = results;

            // Envío de mensaje vía sockets para actualización de vista
            Rem.message(rem.id, {
                message: 'remLog',
                data: results
            });

            // Si es un cambio de estado se debe obtener el tiempo total y parcial desde el estado anterior
            if (remLog.type === 'statusChanged') {

                if (remLogPrev) {
                    // Cálculo de tiempo desde el estado anterior
                    remLogPrev.duration = moment(remLog.createdAt).diff(moment(remLogPrev.createdAt), 'seconds');

                    remLogPrev.save(() => { });
                }
                // Cálculo de tiempo desde el ingreso del incidente
                remLog.timeFromRemCreate = moment(remLog.createdAt).diff(moment(rem.createdAt), 'seconds');

                // Guardar
                remLog.save(() => { });
            }
        });

        // Next
        cb();
    }
};