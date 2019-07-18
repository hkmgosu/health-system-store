/**
 * Vehicle.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        status: {
            model: 'vehiclestatus'
        },
        searchText: 'string',
        establishment: {
            model: 'establishment'
        },
        km: 'integer',
        currentRem: { model: 'rem' },
        currentRemVehicle: { model: 'remvehicle' },
        category: {
            type: 'string',
            enum: ['samu', 'enrutado', 'nosamu']
        },
        via: {
            type: 'string',
            enum: ['terrestre', 'maritimo', 'aereo'],
            defaultsTo: 'terrestre'
        },
        position: 'json',
        idGPS: 'string',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    afterCreate: (vehicle, cb) => {
        Vehicle
            .findOne(vehicle.id)
            .populate('establishment')
            .then(vehicle => {
                let searchText = vehicle.name + ' ' + (vehicle.establishment ? vehicle.establishment.name : '');
                Vehicle.query(
                    'update vehicle set "searchText" = \'' + searchText + '\' where id = ' + vehicle.id,
                    (err, rawResult) => {
                        if (err) {
                            sails.log(err);
                        }
                    }
                );
            });
        cb();
    },
    afterUpdate: (vehicle, cb) => {
        Vehicle
            .findOne(vehicle.id)
            .populate('status')
            .populate('establishment')
            .then(vehicle => {
                let searchText = vehicle.name + ' ' + (vehicle.establishment ? vehicle.establishment.name : '');
                Vehicle.query(
                    'update vehicle set "searchText" = \'' + searchText + '\' where id = ' + vehicle.id,
                    (err, rawResult) => {
                        if (err) {
                            sails.log(err);
                        }
                    }
                );
                Vehicle.publishUpdate(vehicle.id, vehicle);
            });
        cb();
    }
};