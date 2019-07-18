/**
 * Viatic.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        owner: {
            model: 'employee'
        },
        unit: { model: 'unit' },
        establishment: { model: 'establishment' },
        level: 'integer',
        type: { model: 'viatictype' },
        legalQuality: { model: 'legalquality' },
        place: 'string',
        commune: { model: 'commune' },
        region: { model: 'region' },
        reason: 'string',
        transportType: {
            type: 'string',
            enum: ['Bus', 'Ferrocarril', 'Avión', 'Vehículo propio', 'Vehículo SSVQ']
        },
        requireTransport: 'boolean',
        requireHotel: 'boolean',
        fromDate: 'date',
        toDate: 'date',
        status: { model: 'workflowstatus' },
        statusLog: 'string',
        daysDetails: 'array',
        // Días completos
        completeDayQuantity: 'integer',
        completeDayUnitValue: 'integer',
        completeDayAmount: 'integer',
        // Días parciales
        partialDayQuantity: 'integer',
        partialDayUnitValue: 'integer',
        partialDayAmount: 'integer',
        // Total a pagar
        totalAmount: 'integer',
        closureList: {
            collection: 'viaticclosure',
            via: 'viaticList'
        },
        // ID cierres
        closureTesoreria: { model: 'viaticclosure' },
        closureContabilidad: { model: 'viaticclosure' },
        closurePartes: { model: 'viaticclosure' },
        // Glosa resolución e item presupuestario
        numResExenta: 'string',
        dateResExenta: 'date',
        numFolio: 'string',
        numFolioTesoreria: 'string',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

