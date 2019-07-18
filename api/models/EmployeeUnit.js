/**
 * UnitEmployee.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        role: {
            type: 'string',
            enum: ['boss', 'surrogateBoss']
        },
        startPeriod: 'date',
        endPeriod: 'date',
        employee: {
            model: 'employee'
        },
        unit: {
            model: 'unit'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

