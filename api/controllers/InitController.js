/**
 * InitController
 *
 * @description :: Server-side logic for managing inits
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

module.exports = {
    afp: function (req, res) {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports;
        var workbook = xlsx.readFile(imports.filePath);
        var afps     = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.afp]);

        InitService
            .initAfp(afps)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    employee: function(req, res) {
        var xlsx      = require('xlsx');
        var imports   = sails.config.imports;
        var workbook  = xlsx.readFile(imports.filePath);
        var employees = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.employee]);

        InitService
            .initEmployee(employees)
            .then( function(resp) {
                sails.log(resp);
                return res.send({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: resp});
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
            });
    },
    establishment: function (req, res) {
        var xlsx           = require('xlsx');
        var imports        = sails.config.imports;
        var workbook       = xlsx.readFile(imports.filePath);
        var establishments = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.establishment]);

        InitService
            .initEstablishment(establishments)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    establishmentType: function (req, res) {
        var xlsx               = require('xlsx');
        var imports            = sails.config.imports;
        var workbook           = xlsx.readFile(imports.filePath);
        var establishmentsType = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.establishmentType]);

        InitService
            .initEstablishmentType(establishmentsType)
            .then( function(resp) {
                sails.log(resp);
                return res.send({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: resp});
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
            });
    },
    healthCare: function (req, res) {
        var xlsx        = require('xlsx');
        var imports     = sails.config.imports;
        var workbook    = xlsx.readFile(imports.filePath);
        var healthCares = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.healthCare]);

        InitService
            .initHealthCare(healthCares)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    job: function (req, res) {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports;
        var workbook = xlsx.readFile(imports.filePath);
        var jobs     = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.job]);

        InitService
            .initJob(jobs)
            .then( function(resp) {
                sails.log(resp);
                return res.send({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: resp});
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
            });
    },
    legalQuality: function (req, res) {
        var xlsx           = require('xlsx');
        var imports        = sails.config.imports;
        var workbook       = xlsx.readFile(imports.filePath);
        var legalQualities = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.legalQuality]);

        InitService
            .initLegalQuality(legalQualities)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });

    },
    plant: function (req, res) {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports;
        var workbook = xlsx.readFile(imports.filePath);
        var plants   = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.plant]);

        InitService
            .initPlant(plants)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });

    },
    requestLabel: function (req, res) {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports;
        var workbook = xlsx.readFile(imports.filePath);
        var requestLabels     = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.requestLabel]);

        InitService
            .initRequestLabel(requestLabels)
            .then( function(resp) {
                sails.log(resp);
                return res.send({ok: true, msg: 'REQUESTLABEL.SUCCESS.CREATE', obj: resp});
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({ok: false, msg: 'REQUESTLABEL.ERROR.CREATE', obj: err});
            });
    },
    requestState: function (req, res) {
        var imports = sails.config.imports;
        InitService
            .initRequestState(imports.requestStatesDefault)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    typeCasting: function(req, res) {
        var xlsx         = require('xlsx');
        var rutjs        = require('rutjs');
        var moment       = require('moment');
        var imports      = sails.config.imports;
        var workbook     = xlsx.readFile(imports.typeCasting.filePath);
        var consolidated = xlsx.utils.sheet_to_json(workbook.Sheets[imports.typeCasting.excelSheet.consolidated]);
        var employeesRut = [];
        var employeesKeys = {};

        // Quito rut invalidos y campos vacios
        consolidated = _.compact(_.map(consolidated, function(employee) {
            if (employee.rut) {
                var rut = new rutjs(employee.rut);
                if (rut.validate()) {
                    employee.rut = rut.getCleanRut();
                    employeesRut.push(employee.rut);
                    return employee;
                }
            }
        }));

        // Se obtienen ruts unicos
        employeesRut = _.uniq(employeesRut);

        var findEmployees = function (callback) {
            Employee
                .find({
                    deleted: false,
                    rut: employeesRut
                }).exec(function (err, employees) {
                    if (err) {
                        callback(err);
                    } else {
                         _.map(employees, function(employee){
                            employeesKeys[employee.rut] = employee.id;
                        });
                        callback(null, employees);
                    }
                });
        };

        var differenceEmployees = function (data, callback) {
            var dataRut           = _.map(data, 'rut');
            var employeesToCreate = _.difference(employeesRut, dataRut);
            callback(null, employeesToCreate);
        };

        var mapEmployeesToCreate = function (toCreate, callback) {
            var employees = [];
            _.map(toCreate, function(employee) {
                var employeeTocreate = _.filter(consolidated, {rut: employee});
                var employeeData = employeeTocreate[employeeTocreate.length - 1];
                employees.push({
                    name         : employeeData.name,
                    rut          : employeeData.rut,
                    jobs         : [{
                        job      : employeeData.job,
                        isPrimary: true
                    }],
                    plant        : employeeData.plant,
                    level        : employeeData.level,
                    establishment: employeeData.establishment,
                    password     : employeeData.rut.substr(0,4)
                });
            });
            callback(null, employees);
        };

        var createEmployee = function(data, callback) {
            if (data.length > 0) {
                Employee.create(data).exec(function (err, employees) {
                    if (err) {
                        callback(err);
                    } else {
                        _.map(employees, function(employee){
                            employeesKeys[employee.rut] = employee.id;
                        });
                        callback(null, employees);
                    }
                });
            } else {
                callback(null, []);
            }
        };

        async.waterfall([
            findEmployees,
            differenceEmployees,
            mapEmployeesToCreate,
            createEmployee
        ],
        function(err, results) {
            if (err) {
                //return res.send({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
                sails.log({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
            } else {
                consolidated = _.map(consolidated, function(employee){
                    employee.employee = employeesKeys[employee.rut];
                    if (!moment(employee.antiquityGrade,'M/D/YYYY').isValid()) {
                        employee.antiquityGrade = null;
                    }
                    if (!moment(employee.antiquityJob,'M/D/YYYY').isValid()) {
                        employee.antiquityJob = null;
                    }
                    return employee;
                });
                InitService
                    .initTypeCasting(consolidated)
                    .then( function(resp) {
                        sails.log({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: resp});
                        //return res.send({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: resp});
                    })
                    .catch( function(err) {
                        sails.log({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
                        //return res.send({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
                    });
            }
        });

        return res.send({ok: true, msg: 'STATE.SUCCESS.CREATING'});

    },
    unit: function (req, res) {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports;
        var workbook = xlsx.readFile(imports.filePath);
        var units    = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.unit]);

        InitService
            .initUnit(units)
            .then( function(resp) {
                sails.log(resp);
                return res.send({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: resp});
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
            });
    },
    unitType: function (req, res) {
        var xlsx      = require('xlsx');
        var imports   = sails.config.imports;
        var workbook  = xlsx.readFile(imports.filePath);
        var unitsType = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.unitType]);

        InitService
            .initUnitType(unitsType)
            .then( function(resp) {
                sails.log(resp);
                return res.send({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: resp});
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
            });
    },
    region: function (req, res) {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var regions     = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.region]);

        InitService
            .initRegion(regions)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    commune: function (req, res) {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var communes     = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.commune]);

        InitService
            .initCommune(communes)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    callReason: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var callReason = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.callReason]);

        InitService
            .initCallReason(callReason)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    subCallReason: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var subCallReason = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.subCallReason]);

        InitService
            .initSubCallReason(subCallReason)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'SUBCALLREASON.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'SUBCALLREASON.ERROR.CREATE',
                    obj: err
                });
            });
    },
    applicantType: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var applicantType = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.applicantType]);

        InitService
            .initApplicantType(applicantType)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    medicine: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var medicine = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.medicine]);

        InitService
            .initMedicine(medicine)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    medicineVia: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var medicineVia = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.medicineVia]);

        InitService
            .initMedicineVia(medicineVia)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    categoryMedicine: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var categoryMedicine = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.categoryMedicine]);

        InitService
            .initCategoryMedicine(categoryMedicine)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    subCategoryMedicine: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var subCategoryMedicine = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.subCategoryMedicine]);

        InitService
            .initSubCategoryMedicine(subCategoryMedicine)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    drugCategory: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var drugCategory = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.drugCategory]);

        InitService
            .initDrugCategory(drugCategory)
            .then( function(resp) {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    remStatus: function (req, res) {
        var imports  = sails.config.imports;
        InitService
            .initRemStatus(imports.remStatus)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    transferStatus: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var transferStatus = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.transferStatus]);

        InitService
            .initTransferStatus(transferStatus)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    ecg: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var ecg = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.ecg]);

        InitService
            .initEcg(ecg)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    attentionClass: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var attentionClass = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.attentionClass]);

        InitService
            .initAttentionClass(attentionClass)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    attentionItem: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var attentionItem = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.attentionItem]);

        InitService
            .initAttentionItem(attentionItem)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'STATE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'STATE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    vehicle: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.samu;
        var workbook = xlsx.readFile(imports.filePath);
        var vehicleList = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.vehicle]);

        InitService
            .initVehicle(vehicleList)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'VEHICLE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'VEHICLE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    general: function(req, res) {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports;
        var workbook = xlsx.readFile(imports.filePath);

        var establishmentsType = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.establishmentType]);
        var establishments     = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.establishment]);
        var unitsType          = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.unitType]);
        var units              = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.unit]);
        var legalQualities     = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.legalQuality]);
        var healthCares        = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.healthCare]);
        var afps               = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.afp]);
        var employees          = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.employee]);
        var jobs               = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.job]);
        var requestLabel       = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.requestLabel]);
        var plants             = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.plant]);
        var requestStates      = imports.requestStatesDefault;

        var initEstablishmentsType = function (callback) {
            InitService
                .initEstablishmentType(establishmentsType)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null,resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initUnitsType = function (callback) {
            InitService
                .initUnitType(unitsType)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initLegalQualities = function (callback) {
            InitService
                .initLegalQuality(legalQualities)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initHealthCares = function (callback) {
            InitService
                .initHealthCare(healthCares)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initAfps = function (callback) {
            InitService
                .initAfp(afps)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initEstablishments = function (callback) {
            InitService
                .initEstablishment(establishments)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initUnits = function (callback) {
            InitService
                .initUnit(units)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initRequestStates = function (callback) {
            InitService
                .initRequestState(requestStates)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initJobs = function (callback) {
            InitService
                .initJob(jobs)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initEmployees = function (callback) {
            InitService
                .initEmployee(employees)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initPlant = function (callback) {
            InitService
                .initPlant(plants)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        var initRequestLabel = function (callback) {
            InitService
                .initRequestLabel(requestLabel)
                .then( function(resp) {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch( function(err) {
                    sails.log(err);
                    callback(err);
                });
        };

        async.series([
            initEstablishmentsType,
            initUnitsType,
            initLegalQualities,
            initHealthCares,
            initAfps,
            initEstablishments,
            initUnits,
            initRequestStates,
            initJobs,
            initPlant,
            initRequestLabel,
            initEmployees
        ],
        function (err, result) {
            if (err) {
                sails.log({ok: false, msj: 'STATE.ERROR.CREATE', obj: err});
            } else {
                sails.log({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: result.pop()});
            }
        });

        return res.send({ok: true, msg: 'STATE.SUCCESS.CREATING'});
    },
    employeeSamu: function(req, res) {
        var xlsx      = require('xlsx');
        var imports   = sails.config.imports.samu;
        var workbook  = xlsx.readFile(imports.filePath);
        var employees = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.employee]);

        InitService
            .initEmployeeSamu(employees)
            .then( function(resp) {
                sails.log(resp);
                return res.send({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: resp});
            })
            .catch( function(err) {
                sails.log(err);
                return res.send({ok: false, msg: 'STATE.ERROR.CREATE', obj: err});
            });
    },
    resource: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.resource;
        var workbook = xlsx.readFile(imports.filePath);
        var resources = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.resource]);

        InitService
            .initResource(resources)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'RESOURCE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'RESOURCE.ERROR.CREATE',
                    obj: err
                });
            });
    }, 
    damageType: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var damageType = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.damageType]);

        InitService
            .initDamageType(damageType)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    resourceStatus: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.resource;
        var workbook = xlsx.readFile(imports.filePath);
        var status = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.resourceStatus]);

        InitService
            .initResourceStatus(status)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'RESOURCE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'RESOURCE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    adverseEventType: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var eventType = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.eventType]);

        InitService
            .initAdverseEventType(eventType)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    resourceType: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.resource;
        var workbook = xlsx.readFile(imports.filePath);
        var types = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.resourceType]);

        InitService
            .initResourceType(types)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'RESOURCE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'RESOURCE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    associatedProcess: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var associatedProcess = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.associatedProcess]);

        InitService
            .initAssociatedProcess(associatedProcess)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    employeeResource: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.resource;
        var workbook = xlsx.readFile(imports.filePath);
        var register = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.employeeResource]);

        InitService
            .initEmployeeResource(register)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok : true,
                    msg: 'RESOURCE.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok : false,
                    msg: 'RESOURCE.ERROR.CREATE',
                    obj: err
                });
            });
    },
    tupleForm: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var tupleForm = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.tupleForm]);

        InitService
            .initTupleForm(tupleForm)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    resourceGeneral: (req, res) => {
        var xlsx     = require('xlsx');
        var imports  = sails.config.imports.resource;
        var workbook = xlsx.readFile(imports.filePath);

        var status = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.resourceStatus]);
        var types = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.resourceType]);
        var resources = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.resource]);
        var register = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.employeeResource]);

        var initResourceStatus = callback => {
            InitService
                .initResourceStatus(status)
                .then(resp => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch(err => {
                    sails.log(err);
                    callback(err);
                });
        };
        //TODO:
        var initResourceType = callback => {
            InitService
                .initResourceType(types)
                .then(resp => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch(err => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initResource = callback => {
            InitService
                .initResource(resources)
                .then(resp => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch(err => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initEmployeeResource = callback => {
            InitService
                .initEmployeeResource(register)
                .then(resp => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch(err => {
                    sails.log(err);
                    callback(err);
                });
        };

        async.series([
            initResourceStatus,
            initResourceType,
            initResource,
            initEmployeeResource
        ],
        (err, result) => {
            if (err) {
                sails.log({ok: false, msj: 'RESOURCE.ERROR.CREATE', obj: err});
            } else {
                sails.log({ok: true, msg: 'RESOURCE.SUCCESS.CREATE', obj: result.pop()});
            }
        });

        return res.send({ok: true, msg: 'RESOURCE.SUCCESS.CREATING'});

    },
    placeFall: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var placeFall = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.placeFall]);

        InitService
            .initPlaceFall(placeFall)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    fromFall: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var fromFall = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.fromFall]);

        InitService
            .initFromFall(fromFall)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    activityFall: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var activityFall = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.activityFall]);

        InitService
            .initActivityFall(activityFall)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    eventConsequence: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var eventConsequence = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.eventConsequence]);

        InitService
            .initEventConsequence(eventConsequence)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    preventiveMeasure: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var measure = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.preventiveMeasure]);

        InitService
            .initPreventiveMeasure(measure)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    riskCategorization: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var risk = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.riskCategorization]);

        InitService
            .initRiskCategorization(risk)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    previousFall: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var previousFall = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.previousFall]);

        InitService
            .initPreviousFall(previousFall)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    consciousnessState: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var state = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.consciousnessState]);

        InitService
            .initConsciousnessState(state)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    typeMedication: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var type = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.typeMedication]);

        InitService
            .initTypeMedication(type)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    sensoryDeficit: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var sensory = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.sensoryDeficit]);

        InitService
            .initSensoryDeficit(sensory)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    patientMovility: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var movility = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.patientMovility]);

        InitService
            .initPatientMovility(movility)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    patientWalk: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var walk = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.patientWalk]);

        InitService
            .initPatientWalk(walk)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    adverseEventStatus: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var status = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.adverseEventStatus]);

        InitService
            .initAdverseEventStatus(status)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    stageError: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var stageError = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.stageError]);

        InitService
            .initStageError(stageError)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    medicationTypeError: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var medicationTypeError = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.medicationTypeError]);

        InitService
            .initMedicationTypeError(medicationTypeError)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    gradeUpp: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var gradeUpp = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.gradeUpp]);

        InitService
            .initGradeUpp(gradeUpp)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    localizationUpp: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var localizations = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.localizationUpp]);

        InitService
            .initLocalizationUpp(localizations)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    dependenceRisk: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var dependences = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.dependenceRisk]);

        InitService
            .initDependenceRisk(dependences)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    originOccurrence: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var origins = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.originUpp]);

        InitService
            .initOriginOccurrence(origins)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    tracingUpp: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var tracings = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.tracingUpp]);

        InitService
            .initTracingUpp(tracings)
            .then((resp) => {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'ADVERSEEVENT.SUCCESS.CREATE',
                    obj: resp
                });
            })
            .catch((err) => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'ADVERSEEVENT.ERROR.CREATE',
                    obj: err
                });
            });
    },
    hospitalDevice: async (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);
        var hospitalDevices = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.hospitalDevice]);

        try {
            var resp = await InitService.initHospitalDevice(hospitalDevices);
            return res.send({ ok: true, msg: 'ADVERSEEVENT.SUCCESS.CREATE', obj: resp });
        } catch (e) {
            sails.log(e);
            return res.send({ ok: false, msg: 'ADVERSEEVENT.ERROR.CREATE', obj: e });
        }
    },
    adverseEventGeneral: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.adverseEvent;
        var workbook = xlsx.readFile(imports.filePath);

        var damageType = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.damageType]);
        var eventType = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.eventType]);
        var associatedProcess = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.associatedProcess]);
        var tupleForm = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.tupleForm]);
        var placeFall = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.placeFall]);
        var fromFall = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.fromFall]);
        var activityFall = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.activityFall]);
        var eventConsequence = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.eventConsequence]);
        var measure = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.preventiveMeasure]);
        var risk = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.riskCategorization]);
        var previousFall = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.previousFall]);
        var state = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.consciousnessState]);
        var type = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.typeMedication]);
        var sensory = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.sensoryDeficit]);
        var movility = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.patientMovility]);
        var walk = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.patientWalk]);
        var status = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.adverseEventStatus]);
        var stageError = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.stageError]);
        var medicationTypeError = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.medicationTypeError]);
        var gradeUpp = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.gradeUpp]);
        var localizations = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.localizationUpp]);
        var dependences = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.dependenceRisk]);
        var origins = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.originUpp]);
        var tracings = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.tracingUpp]);

        var initDamageType = (callback) => {
            InitService
                .initDamageType(damageType)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initEventType = (callback) => {
            InitService
                .initAdverseEventType(eventType)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initAssociatedProcess = (callback) => {
            InitService
                .initAssociatedProcess(associatedProcess)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initTupleForm = (callback) => {
            InitService
                .initTupleForm(tupleForm)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initPlaceFall = (callback) => {
            InitService
                .initPlaceFall(placeFall)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initFromFall = (callback) => {
            InitService
                .initFromFall(fromFall)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initActivityFall = (callback) => {
            InitService
                .initActivityFall(activityFall)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initEventConsequence = (callback) => {
            InitService
                .initEventConsequence(eventConsequence)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initPreventiveMeasure = (callback) => {
            InitService
                .initPreventiveMeasure(measure)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initRiskCategorization = (callback) => {
            InitService
                .initRiskCategorization(risk)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initPreviousFall = (callback) => {
            InitService
                .initPreviousFall(previousFall)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initConsciousnessState = (callback) => {
            InitService
                .initConsciousnessState(state)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initTypeMedication = (callback) => {
            InitService
                .initTypeMedication(type)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initSensoryDeficit = (callback) => {
            InitService
                .initSensoryDeficit(sensory)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initPatientMovility = (callback) => {
            InitService
                .initPatientMovility(movility)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initPatientWalk = (callback) => {
            InitService
                .initPatientWalk(walk)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initAdverseEventStatus = (callback) => {
            InitService
                .initAdverseEventStatus(status)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initStageError = (callback) => {
            InitService
                .initStageError(stageError)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initMedicationTypeError = (callback) => {
            InitService
                .initMedicationTypeError(medicationTypeError)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initGradeUpp = (callback) => {
            InitService
                .initGradeUpp(gradeUpp)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initLocalizationUpp = (callback) => {
            InitService
                .initLocalizationUpp(localizations)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initDependenceRisk = (callback) => {
            InitService
                .initDependenceRisk(dependences)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initOriginUpp = (callback) => {
            InitService
                .initOriginUpp(origins)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        var initTracingUpp = (callback) => {
            InitService
                .initTracingUpp(tracings)
                .then((resp) => {
                    sails.log(resp);
                    callback(null, resp);
                })
                .catch((err) => {
                    sails.log(err);
                    callback(err);
                });
        };

        async.series([
            initDamageType,
            initEventType,
            initAssociatedProcess,
            initTupleForm
        ], (err, result) => {
            if (err) {
                sails.log({ ok: false, msj: 'STATE.ERROR.CREATE', obj: err });
            } else {
                async.parallel([
                    initPlaceFall,
                    initFromFall,
                    initActivityFall,
                    initEventConsequence,
                    initPreventiveMeasure,
                    initRiskCategorization,
                    initPreviousFall,
                    initConsciousnessState,
                    initTypeMedication,
                    initSensoryDeficit,
                    initPatientMovility,
                    initPatientWalk,
                    initAdverseEventStatus,
                    initStageError,
                    initMedicationTypeError,
                    initGradeUpp,
                    initLocalizationUpp,
                    initDependenceRisk,
                    initOriginUpp,
                    initTracingUpp
                ], (err) => {
                    if (err) {
                        sails.log({ok: false, msj: 'STATE.ERROR.CREATE', obj: err});
                    } else {
                        sails.log({ok: true, msg: 'STATE.SUCCESS.CREATE', obj: ''});
                    }
                })
            }
        });

        return res.send({ ok: true, msg: 'STATE.SUCCESS.CREATING' });
    }
};

