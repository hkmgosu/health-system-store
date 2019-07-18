/* global sails */

// InitService.js - in api/services

'use strict';

module.exports = {
    initAfp: function (dataSheet) {
        //var Promise = require('bluebird');
        return new Promise(function (resolve, reject) {
            Afp.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    Afp.create(dataSheet).exec(function (err, afps) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(afps);
                        }
                    });
                }
            });
        });
    },
    initRegion: function (dataSheet) {
        //var Promise = require('bluebird');
        return new Promise(function (resolve, reject) {
            Region.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    Region.create(dataSheet).exec(function (err, regions) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(regions);
                        }
                    });
                }
            });
        });
    },
    initCommune: function (dataSheet) {
        //var Promise = require('bluebird');
        return new Promise(function (resolve, reject) {
            Commune.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    Commune.create(dataSheet).exec(function (err, communes) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(communes);
                        }
                    });
                }
            });
        });
    },
    initHealthCare: function (dataSheet) {
        //var Promise = require('bluebird');
        return new Promise(function (resolve, reject) {
            HealthCare.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    HealthCare.create(dataSheet).exec(function (err, healthCares) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(healthCares);
                        }
                    });
                }
            });
        });
    },
    initLegalQuality: function (dataSheet) {
        //var Promise = require('bluebird');
        return new Promise(function (resolve, reject) {
            LegalQuality.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    LegalQuality.create(dataSheet).exec(function (err, legalQualities) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(legalQualities);
                        }
                    });
                }
            });
        });
    },
    initEstablishmentType: function (dataSheet) {
        var fs = require('fs-extra');
        var moment = require('moment');
        var uuidV4 = require('uuid/v4');
        var uploadsPath = '.tmp/uploads/';
        var importPath = 'imports/icons/';

        var mkdirSync = function (path) {
            try {
                fs.mkdirSync(path);
                return true;
            } catch (e) {
                if (e.code != 'EEXIST') {
                    sails.log('No se pudo crear carpeta error: ' + e);
                    return false;
                }
                return true;
            }
        };

        var mkdirDate = function () {
            var year = moment().format('YYYY') + '/';
            var month = moment().format('MM') + '/';
            var day = moment().format('DD') + '/';
            if (mkdirSync(uploadsPath + year)) {
                if (mkdirSync(uploadsPath + year + month)) {
                    if (mkdirSync(uploadsPath + year + month + day)) {
                        return uploadsPath + year + month + day;
                    }
                }
            }
            return uploadsPath;
        };

        var handlerIcon = function (establishmentsType) {
            var pathIcon;
            var fileExt;
            return _.map(establishmentsType, function (establishmentType) {
                if (establishmentType.iconFd !== undefined && establishmentType.iconFd !== '') {
                    pathIcon = mkdirDate();
                    pathIcon = pathIcon + uuidV4();

                    try {
                        fs.copySync(importPath + establishmentType.iconFd, pathIcon);
                    } catch (e) {
                        sails.log('No existe archivo a importar: ' + importPath + establishmentType.iconFd);
                        return establishmentType;
                    }

                    establishmentType.iconFd = pathIcon;
                    establishmentType.hasIcon = true;
                }
                return establishmentType;
            });
        };


        return new Promise(function (resolve, reject) {
            EstablishmentType.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    var data = handlerIcon(dataSheet);
                    EstablishmentType.create(data).exec(function (err, establishmentTypes) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(establishmentTypes);
                        }
                    });
                }
            });
        });
    },
    initUnitType: function (dataSheet) {
        //var Promise = require('bluebird');
        return new Promise(function (resolve, reject) {
            UnitType.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    UnitType.create(dataSheet).exec(function (err, unitTypes) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(unitTypes);
                        }
                    });
                }
            });
        });
    },
    initEstablishment: function (dataSheet) {
        //var Promise = require('bluebird');

        // Se obtienen la tabla de tipos Establecimientos
        var getAllEstablishmentType = function (callback) {
            EstablishmentType.find({ deleted: false }).exec(function (err, establishmentType) {
                callback(null, establishmentType);
            });
        };

        var getEstablishmentInit = function (establishmentType, callback) {
            var establishmentsInit = _.map(dataSheet, function (establishment) {
                establishment.type = (_.find(establishmentType, { 'shortname': establishment.type }) || {}).id || null;
                if (establishment.lat && establishment.lng) {
                    establishment.position = {
                        type: 'Point',
                        coordinates: [establishment.lng, establishment.lat]
                    };
                }
                return _.omit(establishment, ['lat', 'lng']);
            });
            callback(null, establishmentsInit);
        };

        return new Promise(function (resolve, reject) {
            Establishment.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    async.waterfall([
                        getAllEstablishmentType,
                        getEstablishmentInit
                    ],
                        function (err, results) {
                            if (err) {
                                return reject(err);
                            } else {
                                Establishment.create(results).exec(function (err, establishments) {
                                    if (err) {
                                        return reject(err);
                                    } else {
                                        return resolve(establishments);
                                    }
                                });
                            }
                        });
                }
            });
        });
    },
    initUnit: function (dataSheet) {
        //var Promise = require('bluebird');

        // Se obtienen los tipos de unidades
        var getAllUnitType = function (callback) {
            UnitType.find().exec(function (err, unitType) {
                callback(null, unitType);
            });
        };

        // Se obtienen los establecimientos
        var getAllEstablishment = function (callback) {
            Establishment.find().exec(function (err, establishments) {
                callback(null, establishments);
            });
        };

        return new Promise(function (resolve, reject) {
            Unit.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    async.parallel([
                        getAllUnitType,
                        getAllEstablishment
                    ],
                        function (err, results) {
                            if (err) {
                                sails.log(err);
                                return res.send({ ok: false, msg: 'STATE.ERROR.CREATE', obj: '' });
                            } else {
                                var unitTypes = results.shift();
                                var establishments = results.shift();

                                var unitInit = _.map(dataSheet, function (unit) {
                                    unit.type = (_.find(unitTypes, { 'shortname': unit.type }) || {}).id || null;
                                    unit.establishment = (_.find(establishments, { 'shortname': unit.establishment }) || {}).id || null;
                                    return unit;
                                });

                                Unit.create(unitInit).exec(function (err, units) {
                                    if (err) {
                                        sails.log(err);
                                        return reject(err);
                                    } else {
                                        return resolve(units);
                                    }
                                });
                            }
                        });
                }
            });
        });
    },
    initEmployee: function (dataSheet) {
        var rutjs = require('rutjs');
        var bcrypt = require('bcrypt');
        var tempRut;

        return new Promise(function (resolve, reject) {

            var employeeInit = _.map(dataSheet, function (employee) {

                tempRut = new rutjs(employee.rut || '');
                if (tempRut.validate()) {
                    employee.rut = tempRut.getCleanRut();
                } else {
                    employee.rut = null;
                }

                if (!employee.healthcare || isNaN(employee.healthcare)) { employee.healthcare = null; }
                if (!employee.legalquality || isNaN(employee.legalquality)) { employee.legalquality = null; }
                if (!employee.afp || isNaN(employee.afp)) { employee.afp = null; }
                if (!employee.establishment || isNaN(employee.establishment)) { employee.establishment = null; }
                if (!employee.unit || isNaN(employee.unit)) { employee.unit = null; }
                if (!employee.plant || isNaN(employee.plant)) { employee.plant = null; }
                if (employee.job && !isNaN(employee.job)) {
                    employee.jobs = [{
                        job: employee.job,
                        isPrimary: true
                    }];
                } else {
                    employee.job = null;
                }

                if (!employee.birthdate) { employee.birthdate = null; }
                if (!employee.email) { employee.email = null; }
                if (!employee.lastname) { employee.lastname = null; }
                if (!employee.annexe) { employee.annexe = null; }
                if (!employee.level) { employee.level = null; }

                return employee;

            });

            async.eachLimit(employeeInit, 500, function (employee, callback) {
                if (!employee.rut) {
                    return callback('rut no válido del usuario: ' + employee.name);
                }
                Employee
                    .findOne({ rut: employee.rut })
                    .exec(function (err, employeeData) {
                        if (err) {
                            callback(err);
                        } else {
                            if (employeeData) {
                                bcrypt.hash(employeeData.rut.substr(0, 4), 10, function (err, password) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        employee.password = password;
                                        Employee
                                            .update(employeeData.id, employee)
                                            .exec(function (err, employeeData) {
                                                if (err) {
                                                    sails.log('Fallo ' + employee.name);
                                                    callback(err);
                                                } else {
                                                    //sails.log('Usuario actualizado: ' + employeeData[0].name);
                                                    callback();
                                                }
                                            });
                                    }
                                });
                            } else {
                                employee.password = employee.rut.substr(0, 4);
                                Employee
                                    .create(employee)
                                    .exec(function (err, employeeData) {
                                        if (err) {
                                            sails.log('Fallo ' + employee.name);
                                            callback(err);
                                        } else {
                                            //sails.log('Usuario creado: ' + employeeData.name);
                                            callback();
                                        }
                                    });
                            }
                        }
                    });
            }, function (err) {
                if (err) {
                    sails.log('Ha ocurrido un error:\n' + err);
                    return reject(err);
                } else {
                    sails.log('Se han ingresado correctamente los usuarios');
                    return resolve(employeeInit);
                }
            });
        });
    },
    initJob: function (dataSheet) {
        return new Promise(function (resolve, reject) {
            Job.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    Job.create(dataSheet).exec(function (err, jobs) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(jobs);
                        }
                    });
                }
            });
        });
    },
    initRequestLabel: function (dataSheet) {
        return new Promise(function (resolve, reject) {
            RequestLabel.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    RequestLabel.create(dataSheet).exec(function (err, requestLabels) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(requestLabels);
                        }
                    });
                }
            });
        });
    },
    initRequestState: function (data) {
        return new Promise(function (resolve, reject) {
            RequestState.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    RequestState.create(data).exec(function (err, states) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(states);
                        }
                    });
                }
            });
        });
    },
    initPlant: function (dataSheet) {
        _.forEach(dataSheet, function (plant) {
            if (plant.professional && plant.professional === 'TRUE') {
                plant.professional = true;
            } else {
                plant.professional = false;
            }
        });

        return new Promise(function (resolve, reject) {
            Plant.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    Plant.create(dataSheet).exec(function (err, plants) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(plants);
                        }
                    });
                }
            });
        });
    },
    initTypeCasting: function (dataSheet) {
        return new Promise(function (resolve, reject) {
            TypeCasting.destroy({}).exec(function (err) {
                if (err) {
                    return reject(err);
                } else {
                    TypeCasting.create(dataSheet).exec(function (err, typeCastings) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(typeCastings);
                        }
                    });
                }
            });
        });
    },
    initCallReason: (dataSheet) => {
        //var Promise = require('bluebird');
        return new Promise((resolve, reject) => {
            CallReason.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    CallReason.create(dataSheet).exec((err, callreasons) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(callreasons);
                        }
                    });
                }
            });
        });
    },
    initSubCallReason: (dataSheet) => {
        return new Promise((resolve, reject) => {
            SubCallReason.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    SubCallReason.create(dataSheet).exec((err, subcallreasons) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(subcallreasons);
                        }
                    });
                }
            });
        });
    },
    initApplicantType: (dataSheet) => {
        //var Promise = require('bluebird');
        return new Promise((resolve, reject) => {
            ApplicantType.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    ApplicantType.create(dataSheet).exec((err, applicantTypes) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(applicantTypes);
                        }
                    });
                }
            });
        });
    },
    initMedicine: (dataSheet) => {
        _.forEach(dataSheet, (medicine) => {
            medicine.vias = medicine.vias && medicine.vias !== '' ? medicine.vias.split(',').map(Number) : undefined;
            medicine.visibleSamu = medicine.visibleSamu && medicine.visibleSamu === 'TRUE' ? true : false;

            if (!medicine.categoryMedicine || isNaN(medicine.categoryMedicine)) { medicine.categoryMedicine = null; }
            if (!medicine.subCategoryMedicine || isNaN(medicine.subCategoryMedicine)) { medicine.subCategoryMedicine = null; }
            if (!medicine.drugCategory || isNaN(medicine.drugCategory)) { medicine.drugCategory = null; }
        });

        return new Promise((resolve, reject) => {
            Medicine.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    Medicine.create(dataSheet).exec((err, medicines) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(medicines);
                        }
                    });
                }
            });
        });
    },
    initMedicineVia: (dataSheet) => {
        return new Promise((resolve, reject) => {
            MedicineVia.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    MedicineVia.create(dataSheet).exec((err, medicineVias) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(medicineVias);
                        }
                    });
                }
            });
        });
    },
    initCategoryMedicine: (dataSheet) => {
        return new Promise((resolve, reject) => {
            CategoryMedicine.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    CategoryMedicine.create(dataSheet).exec((err, categoryMedicines) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(categoryMedicines);
                        }
                    });
                }
            });
        });
    },
    initSubCategoryMedicine: (dataSheet) => {
        return new Promise((resolve, reject) => {
            SubCategoryMedicine.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    SubCategoryMedicine.create(dataSheet).exec((err, subCategoryMedicines) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(subCategoryMedicines);
                        }
                    });
                }
            });
        });
    },
    initDrugCategory: (dataSheet) => {
        return new Promise((resolve, reject) => {
            DrugCategory.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    DrugCategory.create(dataSheet).exec((err, drugCategories) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(drugCategories);
                        }
                    });
                }
            });
        });
    },
    initRemStatus: (data) => {
        return new Promise((resolve, reject) => {
            RemStatus.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    RemStatus.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initTransferStatus: (data) => {
        return new Promise((resolve, reject) => {
            TransferStatus.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    TransferStatus.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initEcg: (data) => {
        return new Promise((resolve, reject) => {
            Ecg.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    Ecg.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initAttentionClass: (data) => {
        return new Promise((resolve, reject) => {
            AttentionClass.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    AttentionClass.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initAttentionItem: (data) => {
        return new Promise((resolve, reject) => {
            AttentionItem.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    AttentionItem.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initVehicle: (data) => {
        return new Promise((resolve, reject) => {
            Vehicle.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    Vehicle.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initEmployeeSamu: function (dataSheet) {
        var rutjs = require('rutjs');
        var tempRut;

        return new Promise(function (resolve, reject) {

            var employeeInit = _.map(dataSheet, function (employee) {

                tempRut = new rutjs(employee.rut || '');
                if (tempRut.validate()) {
                    employee.rut = tempRut.getCleanRut();
                } else {
                    employee.rut = null;
                }

                if (!employee.healthcare || isNaN(employee.healthcare)) { employee.healthcare = null; }
                if (!employee.legalquality || isNaN(employee.legalquality)) { employee.legalquality = null; }
                if (!employee.afp || isNaN(employee.afp)) { employee.afp = null; }
                if (!employee.establishment || isNaN(employee.establishment)) { employee.establishment = null; }
                if (!employee.unit || isNaN(employee.unit)) { employee.unit = null; }
                if (!employee.plant || isNaN(employee.plant)) { employee.plant = null; }
                if (employee.job && !isNaN(employee.job)) {
                    employee.jobs = [{
                        job: employee.job,
                        isPrimary: true
                    }];
                } else {
                    employee.job = null;
                }

                if (!employee.birthdate) { employee.birthdate = null; }
                if (!employee.email) { employee.email = null; }
                if (!employee.lastname) { employee.lastname = null; }
                if (!employee.annexe) { employee.annexe = null; }
                if (!employee.level) { employee.level = null; }
                if (!employee.profile) { employee.profile = null; }

                return employee;

            });

            async.eachLimit(employeeInit, 500, function (employee, callback) {
                if (!employee.rut) {
                    return callback('rut no válido del usuario: ' + employee.name);
                }
                Employee
                    .findOne({ rut: employee.rut })
                    .exec(function (err, employeeData) {
                        if (err) {
                            callback(err);
                        } else {
                            if (employeeData) {
                                Employee
                                    .update(employeeData.id, _.pick(employee, 'jobs', 'establishment', 'profile'))
                                    .exec(function (err, employeeData) {
                                        if (err) {
                                            sails.log('Fallo ' + employee.name);
                                            callback(err);
                                        } else {
                                            //sails.log('Usuario actualizado: ' + employeeData[0].name);
                                            callback();
                                        }
                                    });
                            } else {
                                employee.password = employee.rut.substr(0, 4);
                                Employee
                                    .create(employee)
                                    .exec(function (err, employeeData) {
                                        if (err) {
                                            sails.log('Fallo ' + employee.name);
                                            callback(err);
                                        } else {
                                            //sails.log('Usuario creado: ' + employeeData.name);
                                            callback();
                                        }
                                    });
                            }
                        }
                    });
            }, function (err) {
                if (err) {
                    sails.log('Ha ocurrido un error:\n' + err);
                    return reject(err);
                } else {
                    sails.log('Se han ingresado correctamente los usuarios');
                    return resolve(employeeInit);
                }
            });
        });
    },
    initResource: data => {
        return new Promise((resolve, reject) => {
            Resource.destroy({}).exec((err) => {
                if (err) { return reject(err); }
                Establishment.find().then(establishmentList => {
                    data.forEach(item => {
                        item.jsonData = {
                            userMail: item.userMail,
                            userName: item.userName,
                            userAnnexe: item.userAnnexe
                        };
                        if (item.nameEstablishment) {
                            let establishment = _.find(establishmentList, { name: item.nameEstablishment });
                            item.establishment = establishment ? establishment.id : null;
                        }
                        item.status = 1;
                    });
                    Resource.create(data).exec((err, resources) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(resources);
                        }
                    });
                });
            });
        });
    },
    initDamageType: (data) => {
        _.forEach(data, type => {
            type.relatedToPatients = type.relatedToPatients && type.relatedToPatients === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            DamageType.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    DamageType.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initAdverseEventType: (data) => {
        _.forEach(data, type => {
            type.deleted = type.deleted && type.deleted === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            AdverseEventType.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    AdverseEventType.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initAssociatedProcess: (data) => {
        return new Promise((resolve, reject) => {
            AssociatedProcess.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    AssociatedProcess.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initTupleForm: (data) => {
        _.forEach(data, type => {
            type.deleted = type.deleted && type.deleted === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            TupleForm.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    TupleForm.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initPlaceFall: (data) => {
        _.forEach(data, place => {
            place.fixedField = place.fixedField && place.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            PlaceFall.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    PlaceFall.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initResourceStatus: data => {
        return new Promise((resolve, reject) => {
            ResourceStatus.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    ResourceStatus.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initFromFall: (data) => {
        _.forEach(data, from => {
            from.fixedField = from.fixedField && from.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            FromFall.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    FromFall.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initResourceType: data => {
        return new Promise((resolve, reject) => {
            ResourceType.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    ResourceType.create(data).exec((err, types) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(types);
                        }
                    });
                }
            });
        });
    },
    initActivityFall: (data) => {
        _.forEach(data, activity => {
            activity.fixedField = activity.fixedField && activity.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            ActivityFall.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    ActivityFall.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initEmployeeResource: data => new Promise((resolve, reject) => {
        EmployeeResource.destroy({}).exec((err) => {
            if (err) { return reject(err); }
            async.forEach(data, (item, cb) => {
                async.waterfall([
                    cb => EmployeeResource.create(item).exec(cb),
                    (employeeResourceCreated, cb) => Resource.update({ id: item.resource }, {
                        currentEmployeeResource: employeeResourceCreated.id,
                        currentEmployee: item.employee,
                        status: 2
                    }).exec(cb)
                ], cb);
            }, err => {
                err ? reject(err) : resolve();
            });
        });
    }),
    initEventConsequence: (data) => {
        _.forEach(data, consequence => {
            consequence.visibleMedication = consequence.visibleMedication && consequence.visibleMedication === 'TRUE' ? true : false;
            consequence.visibleFall = consequence.visibleFall && consequence.visibleFall === 'TRUE' ? true : false;
            consequence.fixedField = consequence.fixedField && consequence.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            EventConsequence.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    EventConsequence.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initPreventiveMeasure: (data) => {
        _.forEach(data, measure => {
            measure.visibleUpp = measure.visibleUpp && measure.visibleUpp === 'TRUE' ? true : false;
            measure.visibleFall = measure.visibleFall && measure.visibleFall === 'TRUE' ? true : false;
            measure.hasObservation = measure.hasObservation && measure.hasObservation === 'TRUE' ? true : false;
            measure.fixedField = measure.fixedField && measure.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            PreventiveMeasure.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    PreventiveMeasure.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initRiskCategorization: (data) => {
        return new Promise((resolve, reject) => {
            RiskCategorization.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    RiskCategorization.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initPreviousFall: (data) => {
        _.forEach(data, previous => {
            previous.fixedField = previous.fixedField && previous.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            PreviousFall.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    PreviousFall.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initConsciousnessState: (data) => {
        _.forEach(data, state => {
            state.fixedField = state.fixedField && state.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            ConsciousnessState.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    ConsciousnessState.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initTypeMedication: (data) => {
        _.forEach(data, type => {
            type.fixedField = type.fixedField && type.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            TypeMedication.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    TypeMedication.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initSensoryDeficit: (data) => {
        _.forEach(data, sensory => {
            sensory.fixedField = sensory.fixedField && sensory.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            SensoryDeficit.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    SensoryDeficit.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initPatientMovility: (data) => {
        _.forEach(data, movility => {
            movility.fixedField = movility.fixedField && movility.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            PatientMovility.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    PatientMovility.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initPatientWalk: (data) => {
        _.forEach(data, walk => {
            walk.fixedField = walk.fixedField && walk.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            PatientWalk.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    PatientWalk.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initAdverseEventStatus: (data) => {
        _.forEach(data, status => {
            status.finished = status.finished && status.finished === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            AdverseEventStatus.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    AdverseEventStatus.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initStageError: data => {
        _.forEach(data, stage => {
            stage.fixedField = stage.fixedField && stage.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            StageError.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    StageError.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initMedicationTypeError: data => {
        _.forEach(data, medication => {
            medication.fixedField = medication.fixedField && medication.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            MedicationTypeError.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    MedicationTypeError.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initGradeUpp: data => {
        return new Promise((resolve, reject) => {
            GradeUpp.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    GradeUpp.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initLocalizationUpp: data => {
        _.forEach(data, localization => {
            localization.fixedField = localization.fixedField && localization.fixedField === 'TRUE' ? true : false;
        });
        return new Promise((resolve, reject) => {
            LocalizationUpp.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    LocalizationUpp.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initOriginOccurrence: data => {
        return new Promise((resolve, reject) => {
            OriginOccurrence.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    OriginOccurrence.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initTracingUpp: data => {
        return new Promise((resolve, reject) => {
            TracingUpp.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    TracingUpp.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initDependenceRisk: data => {
        return new Promise((resolve, reject) => {
            DependenceRisk.destroy({}).exec((err) => {
                if (err) {
                    return reject(err);
                } else {
                    DependenceRisk.create(data).exec((err, status) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(status);
                        }
                    });
                }
            });
        });
    },
    initMedicineService: data => {
        return new Promise((resolve, reject) => {
            MedicineService.destroy({}).exec((err) => {
                if (err) return reject(err);
                else {
                    MedicineService.create(data).exec((err, status) => {
                        if (err) return reject(err);
                        else return resolve(status);
                    });
                }
            });
        });
    },
    initHospitalDevice: async data => {
        try {
            await HospitalDevice.destroy({}); 
            return await HospitalDevice.create(data)
        }
        catch (e) { return Promise.reject(e) };
    }
};