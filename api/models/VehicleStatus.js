/**
 * VehicleStatus.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        description: 'string',
        type: {
            type: 'string',
            enum: ['disponible', 'nodisponible', 'ensalida', 'salidafinalizada']
        },
        order: 'integer',
        cod: {
            type: 'string',
            unique: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};