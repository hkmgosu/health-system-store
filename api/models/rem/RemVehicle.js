/**
 * RemVehicle.js
 *
 * @description :: TODO  : You might write a short summary of how this model works and what it represents here.
 * @docs        :: http  : //sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        vehicle: {
            model: 'Vehicle'
        },
        rem: {
            model: 'Rem',
            index: true
        },
        status: {
            model: 'vehiclestatus'
        },
        type: {
            type: 'string',
            enum: ['public', 'private']
        },
        transfer: {
            model: 'transfertype'
        },
        patients: {
            collection: 'rempatient',
            via: 'vehicle'
        },
        kmDeparture: 'integer',
        kmArrival: 'integer',
        arrivalTime: 'integer', // Tiempo de llegada al lugar del incidente en minutos
        via: {
            type: 'string',
            enum: ['terrestre', 'maritimo', 'aereo'],
            defaultsTo: 'terrestre'
        },
        isPrivate: 'boolean',
        particularDescription: 'string',
        establishment: {
            model: 'establishment'
        },
        deliveryEstablishment: {
            model: 'establishment'
        },
        deliveredType: {
            type: 'string',
            enum: ['m1', 'm2', 'm3', 'x5']
        },
        requestDescription: 'string',
        requestedType: {
            type: 'string',
            enum: ['m1', 'm2', 'm3', 'x5']
        },
        participantList: {
            collection: 'participant',
            via: 'remVehicle'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};