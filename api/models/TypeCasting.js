/**
 * TypeCasting.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        antiquityGrade: 'date',
        antiquityJob: 'date',
        antiquityService: 'integer',
        antiquityPublicAdmin: 'integer',
        score: 'string',
        priority: 'integer',
        level: 'integer',
        year: {
            type: 'integer',
            required: true
        },
        employee: {
            model: 'employee',
            required: true
        },
        yearEmployee: {
            type: 'string',
            unique: true
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    beforeValidation: function (values, next) {
        values.yearEmployee = values.employee + '-' + values.year;
        next();
    }
};