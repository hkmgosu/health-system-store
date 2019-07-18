/* global sails */

// InternalService.js - in api/services

'use strict';

module.exports = {
    /**
     *
     * @param {type} options
     * @returns {undefined}
     */
    validateDefaultEmployee: function (rut, password) {
        var fs = require('fs');
        var path = require('path');
        var fileName = path.join(__dirname, '..', '_private/defaultUser.json');
        try {
            fs.statSync(fileName);
            var defaultUser = JSON.parse(fs.readFileSync(fileName));
            if (defaultUser.enable
                && defaultUser.rut === rut
                && defaultUser.password === password) {

                var findControllers = function (modules) {
                    return _.each(modules, function (module, key) {
                        if (module.config) {
                            if (module.config.privileges) {
                                _.each(module.config.privileges, function (privilege, key) {
                                    module.config.privileges[key] = true;
                                });
                            }
                            if (module.config._controllers) {
                                delete module.config._controllers;
                            }
                        }
                        if (module.modules) {
                            findControllers(module.modules);
                        }
                    });
                };
                var profile = JSON.parse(fs.readFileSync('.tmp/profiles.json'));
                findControllers(profile);
                defaultUser.profile.profiles = profile;

                return defaultUser;
            }
        } catch (err) {
            return false;
        }
        return false;
    },
    getUserType: function (idEmployee, idRequest) {
        return new Promise(function (resolve, reject) {
            async.parallel({
                stakeholders: (cb) => {
                    RequestStakeholders.find({
                        request: idRequest,
                        employee: idEmployee,
                        deleted: false
                    }).exec(function (err, stakeholders) {
                        cb(err, _.map(stakeholders, 'role') || []);
                    });
                },
                supervisors: (cb) => {
                    Request
                        .findOne({
                            id: idRequest,
                            deleted: false,
                        })
                        .exec(function (err, request) {
                            if (err) {
                                cb(err);
                            } else {
                                if (request && request.unitAssigned) {
                                    Unit
                                        .findOne(request.unitAssigned)
                                        .populate('supervisors', { deleted: false })
                                        .exec(function (err, unit) {
                                            if (_.some(unit.supervisors, { id: idEmployee })) {
                                                cb(null, ['supervisor']);
                                            } else {
                                                cb(null, []);
                                            }
                                        });
                                } else {
                                    cb(null, []);
                                }
                            }
                        });
                }
            }, (err, results) => {
                var concatResults = [].concat(results.stakeholders, results.supervisors);
                if (err || _.isEmpty(concatResults)) {
                    reject(err);
                } else {
                    resolve(concatResults);
                }
            });
        });
    },
    setSearchTextEmployee: (data) => {
        if (!data.id) {
            sails.log('setSearchTextEmployee: no existe id de employee');
            return;
        }
        Employee.findOne({ id: data.id }).then(
            employee => {
                let fullname = [employee.name, employee.lastname].join(employee.name && employee.lastname ? ' ' : '');
                fullname = [fullname, employee.mlastname].join(fullname && employee.mlastname ? ' ' : '');
                async.parallel({
                    unit: (cb) => {
                        Unit.findOne({ id: employee.unit }).then(
                            unit => cb(null, (unit || {}).name || ''),
                            err => cb(err)
                        );
                    },
                    establishment: (cb) => {
                        Establishment.findOne({ id: employee.establishment }).then(
                            establishment => cb(null, (establishment || {}).name || ''),
                            err => cb(err)
                        );
                    },
                    job: (cb) => {
                        Job.findOne({ id: employee.job }).then(
                            job => cb(null, (job || {}).name || ''),
                            err => cb(err)
                        );
                    }
                }, (err, result) => {
                    if (err) {
                        sails.log(err);
                    } else {
                        let searchText = [
                            fullname,
                            employee.rut,
                            result.unit || '',
                            result.establishment || '',
                            result.job || '',
                        ].join(' ');
                        searchText = searchText
                            .toLowerCase()
                            .normalize('NFKD')
                            .replace(/[\u0300-\u036F]/g, '')
                            .replace('\'','\'\'');
                        Employee
                            .query('update employee set "searchText" = \''+ searchText +
                                '\', fullname = \''+ fullname.replace('\'','\'\'') +
                                '\' where id = '+ employee.id,
                            err => {
                                if (err) sails.log(err);
                            });

                    }
                });
            },
            err => {
                sails.log(err);
            }
        );
    },
    setSearchTextPatient: (data) => {
        if (!data.id) {
            sails.log('setSearchTextPatient: no existe id de paciente');
            return;
        }
        Patient.findOne({id: data.id}).then(
            patient => {
                let fullname = [patient.name, patient.lastname].join(patient.name && patient.lastname ? ' ' : '');
                fullname = [fullname, patient.mlastname].join(fullname && patient.mlastname ? ' ' : '');
                
                let searchText = [
                    fullname,
                    patient.identificationNumber
                ].join(' ');
                searchText = searchText
                    .toLowerCase()
                    .normalize('NFKD')
                    .replace(/[\u0300-\u036F]/g, '')
                    .replace('\'','\'\'');
                Patient
                    .query('update patient set "searchText" = \''+ searchText +
                        '\', fullname = \''+ fullname.replace('\'','\'\'') +
                        '\' where id = '+ patient.id,
                    err => {
                        if (err) sails.log(err);
                    });
            },
            err => {
                sails.log(err);
            }
        );
    }
};
