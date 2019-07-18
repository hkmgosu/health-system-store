/**
 * Patient.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        lastname: 'string',
        mlastname: 'string',
        fullname: 'string',
        birthdate: 'date',
        estimatedYears: 'integer',
        estimatedMonths: 'integer',
        estimatedDays: 'integer',
        address: {
            model: 'address'
        },
        addressText: 'string',
        phone: 'string',
        description: 'string',
        gender: {
            type: 'string',
            enum: ['male', 'female']
        },
        identificationNumber: 'string',
        identificationType: {
            type: 'string',
            enum: ['rut', 'passport', 'nn', 'newborn', 'dau', 'foreign'],
            defaultsTo: 'nn'
        },
        identificationKey: {
            type: 'string',
            unique: 'true'
        },
        motherRut: 'string',
        motherName: 'string',
        admissionDate: 'datetime',
        searchText: 'string',
        validated: {
            type: 'boolean',
            defaultsTo: false
        },
        causesUpps: {
            collection: 'causeupp',
            via: 'patient'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        toJSON: function () {
            let patient = this.toObject();
            if (patient.birthdate) {
                let moment = require('moment');
                Object.assign(patient, {
                    estimatedYears: moment().diff(patient.birthdate, 'years'),
                    estimatedMonths: moment().diff(patient.birthdate, 'months') - (12 * moment().diff(patient.birthdate, 'years')),
                });
                var estimatedDaysAux = moment(patient.birthdate).add(patient.estimatedYears, 'year').add(patient.estimatedMonths, 'month');
                patient.estimatedDays = Math.floor(moment.duration(moment().diff(estimatedDaysAux)).asDays());
                patient.birthdate = moment(patient.birthdate).format('MM-DD-YYYY');
            }
            return patient;
        }
    },
    beforeCreate: (values, next) => {
        values.fullname = [values.name, values.lastname].join(values.name && values.lastname ? ' ' : '');
        values.fullname = [values.fullname, values.mlastname].join(values.fullname && values.mlastname ? ' ' : '');
        if (values.identificationType === 'rut' && values.identificationNumber) {
            var rutjs = require('rutjs');
            var rut = new rutjs(values.identificationNumber);
            if (rut.validate()) {
                values.identificationNumber = rut.getCleanRut();
            } else {
                values.identificationNumber = null;
                values.identificationType = 'nn';
            }
        }
        values.identificationKey = ['rut', 'passport', 'foreign'].includes(values.identificationType) ? [values.identificationType, values.identificationNumber].join('') : null;
        next();
    },
    beforeUpdate: (values, next) => {
        if (values.name || values.lastname || values.mlastname) {
            values.fullname = [values.name, values.lastname].join(values.name && values.lastname ? ' ' : '');
            values.fullname = [values.fullname, values.mlastname].join(values.fullname && values.mlastname ? ' ' : '');
        }
        if (values.identificationType || values.identificationNumber) {
            if (values.identificationType === 'rut' && values.identificationNumber) {
                var rutjs = require('rutjs');
                var rut = new rutjs(values.identificationNumber);
                if (rut.validate()) {
                    values.identificationNumber = rut.getCleanRut();
                } else {
                    values.identificationNumber = null;
                    values.identificationType = 'nn';
                }
            }
            values.identificationKey = ['rut', 'passport', 'foreign'].includes(values.identificationType) ? [values.identificationType, values.identificationNumber].join('') : null;
        }
        next();
    },
    afterCreate: function (values, next) {
        InternalService.setSearchTextPatient(values);
        next();
    },
    afterUpdate: function (values, next) {
        InternalService.setSearchTextPatient(values);
        next();
    }
};