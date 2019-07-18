/**
 * VehiclePositionLog.js
 *
 * @description :: TODO  : You might write a short summary of how this model works and what it represents here.
 * @docs        :: http  : //sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    connection: 'mongodbServer',
    attributes: {
        vehicle: {
            model: 'vehicle',
            index: true
        },
        emittedAt: {
            type: 'datetime',
            index: true
        },
        position: 'json',
        velocity: 'integer',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};