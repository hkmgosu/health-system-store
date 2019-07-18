/**
 * Employee.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        email: 'string',
        name: 'string',
        lastname: 'string',
        mlastname: 'string',
        fullname: 'string',
        searchText: 'string',
        birthdate: 'date',
        rut: {
            type: 'string',
            unique: true
        },
        annexe: 'string',
        level: 'integer',
        password: {
            type: 'string'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        profile: {
            model: 'profile'
        },
        profileList: {
            collection: 'profile',
            via: 'employeeList'
        },
        unit: {
            model: 'unit'
        },
        establishment: {
            model: 'establishment'
        },
        afp: {
            model: 'afp'
        },
        healthcare: {
            model: 'healthcare'
        },
        legalquality: {
            model: 'legalquality'
        },
        resources: {
            collection: 'resource',
            via: 'employee',
            through: 'employeeresource'
        },
        job: {
            model: 'job'
        },
        gender: {
            type: 'string',
            enum: ['male', 'female', 'other', 'unknown']
        },
        jobs: {
            collection: 'hasjob',
            via: 'employee'
        },
        createdrequests: {
            collection: 'request',
            via: 'createdBy'
        },
        assignedrequests: {
            collection: 'request',
            via: 'employeeAssigned'
        },
        subscribedrequests: {
            collection: 'request',
            via: 'employee',
            through: 'requeststakeholders'
        },
        supervisedUnits: {
            collection: 'unit',
            via: 'supervisors'
        },
        plant: {
            model: 'plant'
        },
        typeCastings: {
            collection: 'typeCasting',
            via: 'employee'
        },
        personalEmail: 'string',
        firstUpdate: {
            type: 'boolean',
            defaultsTo: false
        },
        hasProfilePicture: {
            type: 'boolean',
            defaultsTo: false
        },
        profilePicturePath: 'string',
        bedManagementEstablishmentSupervised: {
            collection: 'establishment',
            via: 'bedManagementSupervisors'
        },
        subscribedDerivationList: {
            collection: 'derivation',
            via: 'employee',
            through: 'derivationstakeholder'
        },
        // cantidad de intentos para iniciar sesión fallidos
        loginAttempts: {
            type: 'integer',
            defaultsTo: 0
        },
        // último intento de login fallido
        lastAttemptToLogin: {
            type: 'datetime',
        },
        // usuario bloqueado por múltiples intentos
        blockedLogin: {
            type: 'boolean',
            defaultsTo: false
        },
        adverseEventEstablishmentSupervised: {
            collection: 'establishment',
            via: 'adverseEventSupervisors'
        },
        adverseEventUnitSupervised: {
            collection: 'unit',
            via: 'adverseEventSupervisors'
        },
        storageManagedList: {
            collection: 'unit',
            via: 'employee',
            through: 'storagemanager'
        },
        articleCategoryManagedList: {
            collection: 'articlecategory',
            via: 'category',
            through: 'articlecategorymanager'
        },
        /* permisos y viaticos */
        managedByUnit: { model: 'unit' },
        memberOf: {
            collection: 'unit',
            via: 'employee',
            through: 'employeeunit'
        },
        workflowsSupervisor: {
            collection: 'workflowStatus',
            via: 'supervisors'
        },
        /* /permisos y viaticos */
        samuFullAccess: 'boolean',
        toJSON: function () {
            var obj = this.toObject();
            delete obj.profilePicturePath;
            if (obj.birthdate) {
                let moment = require('moment');
                obj.birthdate = moment(obj.birthdate).format('MM-DD-YYYY');
            }
            delete obj.password;
            return obj;
        }
    },
    beforeCreate: function (values, next) {
        if (values.rut) {
            var rutjs = require('rutjs');
            var rut = new rutjs(values.rut);
            if (rut.validate()) {
                values.rut = rut.getCleanRut();
            } else {
                values.rut = null;
            }
        }

        if (values.password) {
            require('bcrypt').hash(values.password, 10, function (err, password) {
                if (err)
                    return next(err);
                values.password = password;
                next();
            });
        } else {
            next();
        }
    },
    afterCreate: function (values, next) {
        InternalService.setSearchTextEmployee(values);
        next();
    },
    beforeUpdate: function (values, next) {
        if (values.rut) {
            var rutjs = require('rutjs');
            var rut = new rutjs(values.rut);
            if (rut.validate()) {
                values.rut = rut.getCleanRut();
            } else {
                values.rut = null;
            }
        }
        next();
    },
    afterUpdate: function (values, next) {
        InternalService.setSearchTextEmployee(values);
        next();
    }
};