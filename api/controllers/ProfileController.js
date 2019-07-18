/**
 * ProfileController
 *
 * @description :: Server-side logic for managing alerts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getConfigProfiles: function (req, res) {
        var fs = require('fs');
        var findControllers = function (object) {
            return _.mapValues(object, function (o) {
                return _.mapValues(o, function (value, key) {
                    if (key == 'config') {
                        delete value._controllers;
                    } else if (key == 'modules') {
                        value = findControllers(value);
                    }
                    return value;
                });
            });
        };
        var profiles = JSON.parse(fs.readFileSync('.tmp/profiles.json'));
        var configProfiles = findControllers(profiles);
        if (configProfiles !== undefined) {
            return res.send({ ok: true, msg: 'PRIVILEGES.SEARCH.FOUND', obj: { profiles: configProfiles } });
        } else {
            return res.send({ ok: false, msg: 'PRIVILEGES.SEARCH.NOTFOUND', obj: { profiles: {} } });
        }
    },
    create: (req, res) => {
        let { profile } = req.body;
        Profile.create(profile).then(
            profile => res.ok(profile),
            err => res.serverError(err)
        );
    },
    update: function (req, res) {
        let profile = req.body.profile;
        if (!profile.id) { return res.badRequest(); }
        Profile.update(profile.id, profile).then(
            profile => res.ok(profile),
            err => res.serverError(err)
        );
    },
    delete: function (req, res) {
        let idProfile = req.body.idProfile;
        if (!idProfile) { return res.badRequest(); }
        Profile.update(idProfile, { deleted: true }).then(
            () => res.ok(),
            err => {
                sails.log(err);
                res.serverError(err);
            }
        );
    },
    getList: (req, res) => {
        let { searchText } = req.body;
        Profile.find({ name: { contains: searchText }, deleted: false }).sort('name ASC').then(
            profileList => res.send({ ok: true, obj: profileList || [] }),
            err => res.send({ ok: false, obj: err })
        );
    },
    getDetails: (req, res) => {
        let { idProfile } = req.body;
        Profile.findOne({ id: idProfile, deleted: false }).then(
            profileData => res.ok(profileData),
            err => res.serverError(err)
        );
    },
    getEmployeeList: (req, res) => {
        let { idProfile, searchText, limit, page } = req.body;
        Profile.findOne(idProfile).populate('employeeList', {
            where: { searchText: { 'contains': searchText } },
            skip: (page - 1) * limit,
            limit: limit
        }).then(
            profile => {
                Employee.find(_.map(profile.employeeList, 'id'))
                    .populate('job')
                    .populate('unit')
                    .populate('establishment')
                    .then(
                        employeeList => res.ok({
                            employeeList: employeeList,
                            employeeListCount: profile.employeeListCount
                        }),
                        err => res.serverError(err)
                    );
            },
            err => res.serverError(err)
        );
    },
    addEmployeeList: (req, res) => {
        let { idProfile, idList } = req.body;

        if (!idProfile || _.isEmpty(idList) || (_.isEmpty(idList.idEmployeeList) && _.isEmpty(idList.idUnitList))) {
            return res.badRequest();
        }

        let idUnitList = idList.idUnitList || [];
        let idEmployeeList = idList.idEmployeeList || [];

        async.waterfall([
            cb => Unit.find(idUnitList).exec(cb),
            (unitList, cb) => {
                let criteria = { or: [] };
                unitList.forEach(unit => {
                    criteria.or.push({
                        hierarchy: { startsWith: unit.hierarchy }
                    });
                });
                Unit.find(criteria).exec(cb);
            },
            (unitList, cb) => Employee.find({ unit: _.map(unitList, 'id') }).exec(cb)
        ], (err, employeeList) => {
            if (err) { return res.serverError(err); }
            Profile.findOne(idProfile).populate('employeeList').then(profile => {
                // Recorro ids por agregar, se valida que no esté ya asociado al perfil
                employeeList.forEach(employee => {
                    if (!_.find(profile.employeeList, { id: employee.id })) {
                        profile.employeeList.add(employee.id);
                    }
                });

                idEmployeeList.forEach(idEmployee => {
                    if (!(_.some(employeeList, { id: idEmployee }) || _.some(profile.employeeList, { id: idEmployee }))) {
                        profile.employeeList.add(idEmployee);
                    }
                });

                profile.save(err => {
                    if (err) {
                        sails.log(err);
                        return res.serverError(err);
                    }
                    ProfileService.setEmployeeListCount(profile.id);
                    return res.ok();
                });
            });
        });
    },
    addAllEmployees: (req, res) => {
        let idProfile = req.body.idProfile;
        if (!idProfile) { return res.badRequest(); }

        async.parallel({
            employeeList: cb => Employee.find({ select: ['id'], where: { deleted: false } }).exec(cb),
            profile: cb => Profile.findOne(idProfile).populate('employeeList').exec(cb)
        }, (err, results) => {
            if (err) { return res.serverError(err); }
            results.employeeList.forEach(employee => {
                if (!_.some(results.profile.employeeList, { id: employee.id })) {
                    results.profile.employeeList.add(employee.id);
                }
            });
            results.profile.save(err => {
                if (err) {
                    sails.log(err);
                    return res.serverError(err);
                }
                ProfileService.setEmployeeListCount(idProfile);
                res.ok();
            });
        });
    },
    removeAllEmployees: (req, res) => {
        let idProfile = req.body.idProfile;
        if (!idProfile) { return res.badRequest(); }

        Profile.findOne(idProfile).populate('employeeList').then(profile => {
            if (_.isEmpty(profile)) { return res.badRequest(); }

            profile.employeeList.forEach(employee => {
                profile.employeeList.remove(employee.id);
            });
            profile.employeeListCount = 0;

            profile.save(err => {
                if (err) {
                    sails.log(err);
                    return res.serverError(err);
                }
                res.ok();
            });
        }, err => res.serverError(err));
    }
};
