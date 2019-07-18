/* global  sails*/

/**
 * , EmployeeController
 *
 * @description :: Server-side logic for managing employees
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    save: function (req, res) {
        delete req.body.employee.supervisedUnits;
        if (req.body.employee.id) {
            Employee
                .update(req.body.employee.id, req.body.employee)
                .exec(function (err, employees) {
                    if (err) {
                        return res.send({
                            ok: false,
                            msg: 'EMPLOYEE.ERROR.SAVE',
                            obj: err
                        });
                    } else {
                        delete employees[0].password;
                        return res.send({
                            ok: true,
                            isNew: false,
                            msg: 'EMPLOYEE.SUCCESS.SAVE',
                            obj: employees[0]
                        });
                    }
                });
        } else {
            req.body.employee.password = (req.body.employee.rut || '1111').substr(0, 4);
            Employee
                .create(req.body.employee)
                .exec(function (err, employee) {
                    if (err) {
                        return res.send({
                            ok: false,
                            msg: 'EMPLOYEE.ERROR.SAVE',
                            obj: err
                        });
                    } else {
                        delete (employee.password);
                        return res.send({
                            ok: true,
                            isNew: true,
                            msg: 'EMPLOYEE.SUCCESS.SAVE',
                            obj: employee
                        });
                    }
                });
        }
    },
    /**
     *
     * @param {type} req
     * @param {type} res
     * @returns {unresolved}
     */
    logout: function (req, res) {
        req.session.destroy(err => {
            if (err) { sails.log(err); }
            return res.send({ ok: true, url: '/' });
        });
    },
    /**
     *
     * @param {type} req
     * @param {type} res
     * @returns {} dependiendo del caso redirecciona a distintas
     *             rutas del sistema.
     */
    login: function (req, res) {
        var _ = require('lodash');
        var moment = require('moment');
        var fs = require('fs');
        var data = req.body.data;
        var getProfiles = function () {
            if (req.session.employee) {
                var profiles = JSON.parse(fs.readFileSync('.tmp/profiles.json'));
                var tempController;
                var employee = req.session.employee;
                var modulesWithControllers = _.merge({}, profiles, employee.profile.profiles);
                var can = { read: [], create: [], update: [], delete: [], view: [] };
                var cleanController = function (controllers) {
                    for (var i = 0; i < controllers.length; i++) {
                        tempController = controllers[i].split('.');
                        var controller = tempController[0].toLowerCase();
                        var action = tempController[1] || '';
                        if (controller.endsWith('controller'))
                            controller = controller.substring(0, controller.lastIndexOf('controller'));
                        controllers[i] = controller + '.' + action;
                    }
                };

                var setMenusToProfile = function (modules, userProfile) {
                    _.map(modules, function (outRoot, keyRoot) {
                        if (userProfile[keyRoot]) {
                            if (_.some(userProfile[keyRoot].config.privileges)) {
                                userProfile[keyRoot].config.menu = _.merge({}, outRoot.config.menu);
                                userProfile[keyRoot].name = outRoot.name;
                                userProfile[keyRoot].description = outRoot.description;
                                if (outRoot.modules) {
                                    setMenusToProfile(outRoot.modules, userProfile[keyRoot].modules);
                                } else {
                                    userProfile[keyRoot].modules = outRoot.modules;
                                }
                            }
                        }
                    });
                };
                setMenusToProfile(profiles, employee.profile.profiles);

                var getPrivileges = function (modules) {
                    _.map(modules, function (module, keyModule) {
                        _.map(module.config.privileges, function (privilege, keyPrivilege) {
                            if (privilege && module.config._controllers && module.config._controllers[keyPrivilege]) {
                                cleanController(module.config._controllers[keyPrivilege]);
                                can[keyPrivilege] = _.union([], can[keyPrivilege], module.config._controllers[keyPrivilege]);
                            }
                        });
                        if (module.modules) {
                            getPrivileges(module.modules);
                        }
                    });
                };
                getPrivileges(modulesWithControllers);
                _.map(modulesWithControllers, function (module, keyModule) {
                    if (module.config.privileges.view) {
                        can.view.push(module.view);
                        if (module.config._controllers) {
                            _.each(module.config._controllers, function (controllers, keyPrivilege) {
                                cleanController(controllers);
                                can[keyPrivilege] = _.union([], can[keyPrivilege], controllers);
                            });
                        }
                    }
                });
                employee.can = can;
            }
        }
            ;
        var redirect = function () {
            if (req.session.employee) {
                if (req.session.employee.can && req.session.employee.can.view.length > 0) {
                    var msg = { ok: true, msg: '', obj: { url: req.session.employee.can.view[0] } };
                    return res.send(msg);
                } else {
                    return res.forbidden('Permission denied');
                }
            }
        };
        // verifica a donde redireccionar según el privilegio del Employee logeado
        // req.session.authenticated = true; //comentar cuando funcione ok
        // req.session.employee = { name: 'pedro', type: 'Admin', email: 'jfcisternasm@gmail.com' }; //comentar cuando funcione ok
        if (_.isUndefined(req.session.employee)) {
            if (_.isUndefined(data)) {
                var msg = { ok: false, msg: 'EMPLOYEE.ERROR.NODATA', obj: {} };
                return res.send(msg);
            } else {
                if (_.isUndefined(data.rut) || _.isUndefined(data.password)) {
                    var msg = { ok: false, msg: 'EMPLOYEE.ERROR.EMPTY', obj: {} };
                    return res.send(msg);
                }
                var defaultEmployee = InternalService.validateDefaultEmployee(data.rut, data.password);
                if (defaultEmployee) {
                    req.session.authenticated = true;
                    req.session.employee = defaultEmployee;
                    getProfiles();
                    redirect();
                } else {
                    Employee.findOne({ rut: data.rut, deleted: false })
                        .populate('profileList', { profiles: { '!': null } })
                        .populate('supervisedUnits')
                        .exec(function (err, employee) {
                            if (err) {
                                var msg = { ok: false, msg: 'EMPLOYEE.ERROR.DATABASE', obj: {} };
                                return res.send(msg);
                            }
                            if (!employee) {
                                var msg = { ok: false, msg: 'EMPLOYEE.ERROR.NOTFOUND', obj: {} };
                                return res.send(msg);
                            }
                            if (employee.blockedLogin) {
                                return res.send({ ok: false, msg: 'EMPLOYEE.ERROR.BLOCKEDLOGIN' })
                            }
                            var bcrypt = require('bcrypt');
                            bcrypt.compare(data.password, employee.password, function (err, valid) {
                                if (valid) {
                                    if (_.isEmpty(employee.profileList)) {
                                        var msg = { ok: false, msg: 'EMPLOYEE.ERROR.NOTPROFILE', obj: {} };
                                        return res.send(msg);
                                    }
                                    employee.profile = {};
                                    employee.profileList.forEach(profile => _.merge(employee.profile, profile));
                                    req.session.authenticated = true;
                                    req.session.employee = employee;
                                    getProfiles();

                                    Employee.update(employee.id, {
                                        blockedLogin: false,
                                        loginAttempts: 0,
                                        lastAttemptToLogin: null
                                    }).then(() => { });
                                    redirect();
                                } else {
                                    var resObj = { ok: false, msg: '' };
                                    if (!employee.loginAttempts || employee.loginAttempts < 5) {
                                        employee.loginAttempts = employee.loginAttempts ? employee.loginAttempts + 1 : 1;
                                        employee.lastAttemptToLogin = new Date();
                                        employee.save(() => { });
                                        resObj.msg = 'EMPLOYEE.ERROR.MAILORPASSINVALID';
                                    } else if (moment().diff(moment(employee.lastAttemptToLogin), 'minutes') > 5) {
                                        employee.lastAttemptToLogin = new Date();
                                        employee.loginAttempts = 1;
                                        employee.save(() => { });
                                        resObj.msg = 'EMPLOYEE.ERROR.MAILORPASSINVALID';
                                    } else {
                                        employee.blockedLogin = true;
                                        employee.save(() => { });
                                        resObj.msg = 'EMPLOYEE.ERROR.BLOCKEDLOGIN';
                                    }
                                    return res.send(resObj);
                                }
                            });
                        });
                }
            }
        } else {
            redirect();
        }
    },
    unlockLogin: (req, res) => {
        if (_.isEmpty(req.body.idEmployee)) { return res.send({ ok: false }); }
        employee.update(req.body.idEmployee, {
            blockedLogin: false,
            loginAttempts: 0,
            lastAttemptToLogin: null
        }).then(employee => {
            res.send({ ok: _.isEmpty(employee) });
        });
    },
    /**
     * Restaurar cuenta de funcionario con contraseña por defecto
     */
    setPassword: function (req, res) {
        let idEmployee = req.body.idEmployee;
        if (!idEmployee) { return res.send({ ok: false }); }
        Employee.findOne(idEmployee).then(employee => {
            if (!employee) { return res.send({ ok: false }); }
            require('bcrypt').hash(employee.rut.substr(0, 4), 10, function (err, password) {
                if (err) { return res.send({ ok: false }); }
                Employee.update(employee.id, {
                    password: password,
                    firstUpdate: false,
                    blockedLogin: false,
                    loginAttempts: 0,
                    lastAttemptToLogin: null
                }).then(
                    (updatedList) => res.send({ ok: !_.isEmpty(updatedList) }),
                    () => res.send({ ok: false })
                );
            });
        }, err => res.send({ ok: false }));
    },
    /**
     * Marca como eliminado un Employee
     *
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete: function (req, res) {
        let idEmployee = req.body.id;
        if (!idEmployee) { return res.send({ ok: false }); }
        Employee.update({ id: idEmployee }, { deleted: true }).then(
            employeeUpdated => res.send({ ok: !_.isEmpty(employeeUpdated) }),
            () => res.send({ ok: false })
        );
    },
    /**
     *
     * @param {type} req
     * @param {type} res
     * @returns {undefined} obj con listado de de Employees
     */
    getList: function (req, res) {
        /**
         * Filtro de búsqueda
         * Se quitan tildes y se lleva a minusculas
         */
        var filter = { deleted: false };
        if (req.body.filter) {
            let filterText = (req.body.filter || '')
                .toLowerCase()
                .normalize('NFKD')
                .replace(/[\u0300-\u036F\.\-]/g, '');
            filterText = '%' + filterText.replace(/\s+/g, '%') + '%';
            filter.searchText = { 'like': filterText };
        }
        let paginate = _.defaults(req.body.paginate || {}, { page: 1, limit: 15 });
        let opts = req.body.opts || {};

        async.series({
            unitList: cb => {
                if (!opts.unitRootHierarchy) { return async.setImmediate(cb); }
                Unit.find({
                    deleted: false,
                    hierarchy: {
                        startsWith: opts.unitRootHierarchy
                    }
                }).then(units => cb(null, _.map(units, 'id')), cb);
            }
        }, (err, results) => {
            if (results.unitList) { filter.unit = results.unitList; }
            async.parallel({
                total: cb => Employee.count(filter).exec(cb),
                list: cb => {
                    Employee.find(filter)
                        .populate('job')
                        .populate('unit')
                        .populate('establishment')
                        .paginate(paginate)
                        .exec(cb)
                }
            }, (err, results) => {
                if (err) { return res.send({ ok: false, obj: err }); }
                res.send({ ok: !!results.list.length, obj: results });
            });
        });
    },
    getListPublic: function (req, res) {
        /**
         * Filtro de búsqueda
         * Se quitan tildes y se lleva a minusculas
         */
        var filter = { deleted: false };
        if (req.body.filter) {
            let filterText = (req.body.filter || '')
                .toLowerCase()
                .normalize('NFKD')
                .replace(/[\u0300-\u036F\.\-]/g, '');
            filterText = '%' + filterText.replace(/\s+/g, '%') + '%';
            filter.searchText = { 'like': filterText };
        }
        let paginate = _.defaults(req.body.paginate || {}, { page: 1, limit: 15 });
        let opts = req.body.opts || {};

        async.series({
            unitList: cb => {
                if (!opts.unitRootHierarchy) { return async.setImmediate(cb); }
                Unit.find({
                    deleted: false,
                    hierarchy: {
                        startsWith: opts.unitRootHierarchy
                    }
                }).then(units => cb(null, _.map(units, 'id')), cb);
            }
        }, (err, results) => {
            if (results.unitList) { filter.unit = results.unitList; }
            async.parallel({
                total: cb => Employee.count(filter).exec(cb),
                list: cb => {
                    Employee.find({
                        where: filter,
                        select: ['id', 'fullname', 'email', 'annexe', 'job', 'unit', 'establishment', 'hasProfilePicture']
                    })
                        .populate('job')
                        .populate('unit')
                        .populate('establishment')
                        .paginate(paginate)
                        .exec(cb)
                }
            }, (err, results) => {
                if (err) { return res.send({ ok: false, obj: err }); }
                res.send({ ok: !!results.list.length, obj: results });
            });
        });
    },
    get: (req, res) => {
        let idEmployee = req.body.idEmployee;
        if (!idEmployee) { return res.send({ ok: false }); }
        Employee.findOne({ id: idEmployee, deleted: false })
            .populate('job')
            .populate('unit')
            .populate('establishment')
            .populate('managedByUnit')
            .populate('profileList')
            .then(
                employee => res.send({ ok: !_.isEmpty(employee), obj: employee }),
                () => res.send({ ok: false })
            );
    },
    getEmployeeName: function (req, res) {
        return res.send({ ok: true, name: req.session.employee.name });
    },
    getParams: function (req, res) {

        // Se obtiene la tabla de plantas
        var getAllPlants = function (callback) {
            Plant.find({ deleted: false }).exec(function (err, plants) {
                callback(null, plants);
            });
        };

        // Se obtienen la tabla de Isapres
        var getAllHealthCare = function (callback) {
            HealthCare.find({ deleted: false }).exec(function (err, healthCare) {
                callback(null, healthCare);
            });
        };

        // Se obtienen la tabla de calidad juridica
        var getAllLegalQuality = function (callback) {
            LegalQuality.find({ deleted: false }).exec(function (err, legalQuality) {
                callback(null, legalQuality);
            });
        };

        // Se obtienen la tabla de Afps
        var getAllAfp = function (callback) {
            return Afp.find({ deleted: false }).exec(function (err, afp) {
                callback(null, afp);
            });
        };

        // Se obtienen la tabla de perfiles
        var getAllProfile = function (callback) {
            return Profile.find({ deleted: false }).exec(function (err, profile) {
                callback(null, profile);
            });
        };

        async.parallel([
            getAllHealthCare,
            getAllLegalQuality,
            getAllAfp,
            getAllProfile,
            getAllPlants
        ],
            function (err, results) {
                if (err) {
                    sails.log(err);
                    return res.send({ ok: false, msg: '', obj: '' });
                } else {
                    return res.send({
                        ok: true, msg: '', obj: {
                            healthcares: results[0],
                            legalQualities: results[1],
                            afps: results[2],
                            profiles: results[3],
                            plants: results[4]
                        }
                    });
                }
            });
    },
    validateEmail: function (req, res) {
        Employee.findOne({ email: req.body.email }).exec(function (err, result) {
            if (err || !result) {
                return res.send({ ok: false, msg: '', obj: {} });
            } else {
                return res.send({ ok: true, msg: '', obj: {} });
            }
        });
    },
    getSupervisedUnits: function (req, res) {
        let idEmployee = req.body.idEmployee;
        Employee
            .findOne(idEmployee)
            .populate('supervisedUnits')
            .then(
                employee => res.send({ ok: true, obj: employee.supervisedUnits }),
                err => res.send({ ok: false, obj: err })
            );
    },
    addSupervisedUnit: function (req, res) {
        let idEmployee = req.body.idEmployee;
        let idUnit = req.body.idUnit;
        let updateUnitSupervisorsCount; // Actualizar contador de supervisores
        Employee
            .findOne(idEmployee)
            .populate('supervisedUnits')
            .then(
                employee => {
                    employee.supervisedUnits.add(idUnit);
                    employee.save(err => {
                        if (err) { res.send({ ok: false, obj: err }); }
                        updateUnitSupervisorsCount(idUnit);
                        return res.send({ ok: true });
                    });
                },
                err => res.send({ ok: false, obj: err })
            );

        updateUnitSupervisorsCount = (idUnit) => {
            Unit
                .findOne(idUnit)
                .populate('supervisors')
                .then(
                    unit => {
                        unit.supervisorsCount = unit.supervisors.length;
                        unit.save(err => sails.log(err || 'Contador de supervisores actualizado'));
                    }
                );
        };
    },
    removeSupervisedUnit: function (req, res) {
        let idEmployee = req.body.idEmployee;
        let idUnit = req.body.idUnit;
        let updateUnitSupervisorsCount; // Actualizar contador de supervisores
        Employee
            .findOne(idEmployee)
            .populate('supervisedUnits')
            .then(
                employee => {
                    employee.supervisedUnits.remove(idUnit);
                    employee.save(err => {
                        if (err) { return res.send({ ok: false, obj: err }); }
                        updateUnitSupervisorsCount(idUnit);
                        return res.send({ ok: true });
                    });
                },
                err => res.send({ ok: false, obj: err })
            );

        updateUnitSupervisorsCount = (idUnit) => {
            Unit
                .findOne(idUnit)
                .populate('supervisors')
                .then(
                    unit => {
                        unit.supervisorsCount = unit.supervisors.length;
                        unit.save(err => sails.log(err || 'Contador de supervisores actualizado'));
                    }
                );
        };
    },
    getSharedFiles: function (req, res) {
        Archive.find({
            owner: req.session.employee.id,
            valid: true,
            deleted: false
        }).sort('id DESC').limit(5).then(archiveList => {
            res.send({ ok: true, obj: archiveList });
        }, err => res.send({ ok: false }));
    },
    getTypecasting: function (req, res) {
        const moment = require('moment');
        Employee.findOne(req.body.id)
            .populate('legalquality')
            .populate('establishment')
            .populate('plant')
            .populate('job')
            .exec(function (err, employee) {
                if (err || !employee) { return res.send({ ok: false }); }
                TypeCasting.find({
                    employee: req.body.id
                }).exec(function (err, typecasting) {
                    if (err) { return res.send({ ok: false, msj: 'ERROR', obj: err }); }
                    typecasting.forEach((tc) => {
                        tc.antiquityJob = (moment(tc.antiquityJob).isValid()) ? moment.utc(tc.antiquityJob).format('D/M/Y') : '';
                        tc.antiquityGrade = (moment(tc.antiquityGrade).isValid()) ? moment.utc(tc.antiquityGrade).format('D/M/Y') : '';
                    });
                    return res.send({ ok: true, obj: { employee: employee, typecasting: typecasting } });
                });
            });
    },
    getMyTypecasting: function (req, res) {
        const moment = require('moment');
        Employee.findOne(req.session.employee.id)
            .populate('legalquality')
            .populate('establishment')
            .populate('plant')
            .populate('job')
            .exec(function (err, employee) {
                if (err || !employee) { return res.send({ ok: false }); }
                TypeCasting.find({
                    employee: req.session.employee.id
                }).exec(function (err, typecasting) {
                    if (err) { return res.send({ ok: false, msj: 'ERROR', obj: err }); }
                    typecasting.forEach((tc) => {
                        tc.antiquityJob = (moment(tc.antiquityJob).isValid()) ? moment.utc(tc.antiquityJob).format('D/M/Y') : '';
                        tc.antiquityGrade = (moment(tc.antiquityGrade).isValid()) ? moment.utc(tc.antiquityGrade).format('D/M/Y') : '';
                    });
                    return res.send({ ok: true, obj: { employee: employee, typecasting: typecasting } });
                });
            });
    },
    /**
     * Método para activar cuenta de funcionario y actualizar sus datos básicos.
     */
    firstUpdate: function (req, res) {
        var employee = req.body.employee;
        if (!_.every(['name', 'lastname', 'mlastname', 'password'], _.partial(_.has, employee))) {
            return res.send({ ok: false, msg: 'USER.ERROR.UPDATEPASS', obj: {} })
        }
        require('bcrypt').hash(employee.password, 10, function (err, password) {
            if (err) return res.send({ ok: false, msg: 'USER.ERROR.UPDATEPASS', obj: err });
            employee.password = password;
            employee.firstUpdate = true;
            employee.email = employee.email || null;
            Employee
                .update(req.session.employee.id, employee)
                .exec(function (err, updatedEmployee) {
                    if (err) return res.send({ ok: false, msg: 'USER.ERROR.ACTIVATE', obj: err });
                    else {
                        _.merge(req.session.employee, employee);
                        return res.send({ ok: true, msg: 'USER.SUCCESS.ACTIVATE', obj: {} });
                    }
                });
        });
    },
    setFullname: function (req, res) {
        Employee.query("update employee set fullname = concat(name, ' ', lastname, ' ', mlastname)", function (err, rawResult) {
            if (err) { return res.serverError(err); }
            sails.log(rawResult);
            return res.ok();
        });
    },
    getPerUnit: function (req, res) {
        if (req.body.unit) {
            Employee
                .find({
                    unit: req.body.unit,
                    deleted: false
                })
                .exec(function (err, employees) {
                    if (err) {
                        //sails.log('error:', err)
                        return res.send({ ok: false, obj: {} });
                    } else {
                        //sails.log.info('Employees:', {employees: employees})
                        return res.send({ ok: true, obj: { employees: employees } });
                    }
                });
        } else {
            return res.send({ ok: false, obj: {} });
        }
    },
    setUnit: function (req, res) {
        if (req.body.employee && req.body.employee.id) {
            Employee
                .update(req.body.employee.id, { unit: req.body.employee.unit || null })
                .then(
                    employee => res.send({ ok: true, msg: 'EMPLOYEE.SUCCESS.SAVE', obj: employee[0] }),
                    err => res.send({ ok: false, msg: 'EMPLOYEE.ERROR.SAVE', obj: err })
                );
        } else {
            return res.send({ ok: false, msg: 'EMPLOYEE.ERROR.SAVE', obj: {} })
        }
    },
    uploadMyProfilePicture: (req, res) => {
        EmployeeService.uploadProfilePicture(req, res, req.session.employee.id);
    },
    uploadProfilePicture: (req, res) => {
        let { idEmployee } = req.body;
        if (!idEmployee) { return res.send({ ok: false }); }
        EmployeeService.uploadProfilePicture(req, res, parseInt(idEmployee));
    },
    deleteMyProfilePicture: (req, res) => {
        EmployeeService.deleteProfilePicture(req, res, req.session.employee.id);
    },
    deleteProfilePicture: (req, res) => {
        let { idEmployee } = req.body;
        if (!idEmployee) { return res.send({ ok: false }); }
        EmployeeService.deleteProfilePicture(req, res, parseInt(idEmployee));
    },
    downloadProfilePicture: function (req, res) {
        let idEmployee = req.allParams().id;
        if (!idEmployee) {
            return res.badRequest();
        }
        Employee
            .findOne(idEmployee)
            .exec(function (err, data) {
                var SkipperDisk = require('skipper-disk');
                var fileAdapter = SkipperDisk();
                res.set('Content-disposition', 'attachment; filename="' + 'Foto' + '"');

                if (err || !data || !data.profilePicturePath) {
                    fileAdapter.read('.tmp/public/assets/images/profile-avatar.png')
                        .on('error', (err) => res.notFound())
                        .pipe(res);
                    return;
                }

                fileAdapter.read(data.profilePicturePath)
                    .on('error', function (err) {
                        fileAdapter.read('.tmp/public/assets/images/profile-avatar.png')
                            .on('error', (err) => res.notFound())
                            .pipe(res);
                    })
                    .pipe(res);
            });
    },
    updatePersonalData: function (req, res) {
        let personalData = req.body;
        Employee
            .update(req.session.employee.id, personalData)
            .then(
                (employees) => res.send({ ok: !_.isEmpty(employees) }),
                (err) => res.send({ ok: false })
            );
    },
    updatePasswordData: function (req, res) {
        let passwordData = req.body;
        const bcrypt = require('bcrypt');
        async.parallel({
            currentPasswordValidation: cb => {
                Employee
                    .findOne(req.session.employee.id)
                    .then(
                        employee => {
                            if (employee.password)
                                bcrypt.compare(passwordData.currentPassword, employee.password, cb);
                            else
                                cb(new Error('Funcionario sin password'));
                        }, err => {
                            cb(err);
                        }
                    );
            },
            newPassword: cb => require('bcrypt').hash(passwordData.newPassword, 10, cb)
        }, (err, results) => {
            if (err || !results.currentPasswordValidation) {
                return res.send({ ok: false, err: err })
            }
            Employee
                .update(req.session.employee.id, {
                    password: results.newPassword
                })
                .then(
                    (employees) => res.send({ ok: !_.isEmpty(employees) }),
                    (err) => res.send({ ok: false, err: err })
                );
        });
    },
    getProfile: function (req, res) {
        Employee
            .findOne(req.session.employee.id)
            .then(employee => res.send({ ok: true, obj: employee }))
            .catch(err => res.send({ ok: false, err: err }))
    },
    getProfileById: function (req, res) {
        let id = req.body.id;
        if (!id) {
            return res.send({ ok: false })
        }
        Employee.findOne(id)
            .populate('job')
            .populate('unit', { deleted: false })
            .populate('establishment', { deleted: false })
            .then(
                employee => res.send({ ok: true, obj: employee }),
                err => res.send({ ok: false, err: err })
            );
    },
    setSearchText: (req, res) => {
        Employee
            .find()
            .exec((err, employees) => {
                if (err) {
                    sails.log('Ha ocurrido un error, setSearchText');
                    return res.send({ ok: false, msg: 'EMPLOYEE.ERROR.SETSEARCHFULLNAME' });
                } else {
                    async.eachLimit(employees, 5, (employee, callback) => {
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
                                callback(err);
                            } else {
                                let searchText = [
                                    employee.fullname,
                                    employee.rut,
                                    result.unit || '',
                                    result.establishment || '',
                                    result.job || '',
                                ].join(' ');
                                employee.searchText = searchText
                                    .toLowerCase()
                                    .normalize('NFKD')
                                    .replace(/[\u0300-\u036F]/g, '');

                                Employee
                                    .update(employee.id, { searchText: employee.searchText })
                                    .then(
                                        employee => callback(),
                                        err => callback(err)
                                    );
                            }
                        });
                    }, (err) => {
                        if (err) {
                            sails.log('Ha ocurrido un error:\n' + err);
                        } else {
                            sails.log('Se han ingresado correctamente los usuarios');
                        }
                    });
                }
            });
        res.send({ ok: true, msg: 'Tarea en proceso' });
    },
    getAdverseEventSupervised: (req, res) => {
        Employee
            .findOne((req.session.employee || {}).id)
            .populate('adverseEventEstablishmentSupervised')
            .populate('adverseEventUnitSupervised')
            .then(
                employee => res.send({ ok: true, obj: _.pick(employee, ['adverseEventEstablishmentSupervised', 'adverseEventUnitSupervised']) }),
                err => res.send({ ok: false, obj: err })
            );
    },
    /**
     * Obtener datos de un funcionario con api externa
     */
    syncFromApi: (req, res) => {
        let identifier = req.body.identifier;
        if (!identifier) { return res.send({ ok: false, msg: 'badRequest' }); }
        MinsalService.getPatient(identifier).then(
            patient => res.send({ ok: true, obj: patient }),
            err => res.send({ ok: false, msg: 'notFound' })
        );
    },
    mapJob: (req, res) => {
        HasJob.find({ isPrimary: true }).then(hasJobList => {
            async.forEachLimit(hasJobList, 100, (hasJob, cb) => {
                Employee.update({ id: hasJob.employee }, {
                    job: hasJob.job
                }).exec(cb);
            }, err => {
                if (err) console.log(err);
                console.log('Proceso finalizado');
            });
        });
        res.send('Trabajando para usted...');
    },
    addProfile: (req, res) => {
        let { idEmployee, idProfile } = req.body;
        if (!idProfile || !idEmployee) { return res.send({ ok: false }); }
        Employee.findOne(idEmployee).then(employee => {
            employee.profileList.add(idProfile);
            employee.save(err => {
                if (err) { return res.send({ ok: false, obj: err }) }
                ProfileService.setEmployeeListCount(idProfile);
                res.send({ ok: true });
            });
        });
    },
    removeProfile: (req, res) => {
        let { idEmployee, idProfile } = req.body;
        if (!idProfile || !idEmployee) { return res.send({ ok: false }); }
        Employee.findOne(idEmployee).then(employee => {
            employee.profileList.remove(idProfile);
            employee.save(err => {
                if (err) { return res.send({ ok: false, obj: err }) }
                ProfileService.setEmployeeListCount(idProfile);
                res.send({ ok: true });
            });
        });
    },
    resetSamu: (req, res) => {
        if ((req.session.employee || {}).id !== -1) return res.send('Pillin pillin, no tienes acceso.')
        var bcrypt = require('bcrypt');
        var xlsx = require('xlsx');
        var toExport = [];
        Employee
            .find({ profile: [5, 10, 12] })
            .then(employees => {
                async.eachLimit(employees, 20, function (employee, cb) {
                    let password = (Math.floor(Math.random() * (99999 - 10000)) + 10000).toString();
                    toExport.push({ rut: employee.rut, password: password });
                    bcrypt.hash(password, 10, function (err, password) {
                        if (err) cb(err);
                        else {
                            Employee
                                .update(employee.id, { firstUpdate: false, password: password })
                                .exec((err, employeeData) => {
                                    if (err) {
                                        sails.log('Fallo ' + employeeData.name);
                                        cb(err);
                                    } else {
                                        cb();
                                    }
                                })
                        }
                    })
                }, err => {
                    if (err) {
                        sails.log(err);
                        res.send('error: ' + err);
                    }
                    else {
                        let wb = xlsx.utils.book_new();
                        let worksheet = xlsx.utils.json_to_sheet(toExport);
                        xlsx.utils.book_append_sheet(wb, worksheet, 'Hoja1');
                        let pathFile = '.tmp/usuarios_samu.xls';
                        xlsx.writeFile(wb, pathFile);

                        var SkipperDisk = require('skipper-disk');
                        var fileAdapter = SkipperDisk();
                        var disposition = 'attachment';
                        res.set('Content-Disposition',
                            disposition + '; filename*=UTF-8\'\'' + encodeURI('usuariosSamu.xls'));
                        fileAdapter
                            .read(pathFile)
                            .on('error', function (err) {
                                return res.notFound();
                            })
                            .pipe(res);
                    }
                });
            });
    }
};