/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

'use strict';

module.exports = function (req, res, next) {
    const id = (req.body || {}).id || (req.query || {}).id;
    const module = (req.body || {}).module || req.options.controller;

    if (id && module) {
        let model;
        if (module === 'viatic') model = Viatic;
        else if (module === 'permission') model = Permission;
        else { return res.badRequest('Falta modulo'); }

        model.findOne(id).then(moduleData => {
            if (_.isEmpty(moduleData)) { return res.badRequest(); }
            if (moduleData.owner === req.session.employee.id) next();
            else {
                async.parallel({
                    workflowsSupervisor: cb => {
                        Employee.findOne(req.session.employee.id).populate('workflowsSupervisor')
                            .then(dataEmployee => cb(null, _.map(dataEmployee.workflowsSupervisor, 'id')), cb)
                    },
                    managedUnits: cb => {
                        EmployeeUnit.find({ employee: req.session.employee.id, role: ['boss', 'surrogateBoss'], deleted: false })
                            .then(employeeUnit => cb(null, _.map(employeeUnit, 'unit')), cb)
                    }
                }, (err, result) => {
                    if (err) return res.badRequest(err);
                    var can = false;
                    let unitsIds = result.managedUnits;
                    let statusIds = result.workflowsSupervisor;
                    if (unitsIds.indexOf(moduleData.unit) !== -1 || statusIds.indexOf(moduleData.status) !== -1) {
                        can = true;
                    } else {
                        // Revisar si es supervisor de un estado del log
                        let statusLogId = (moduleData.statusLog || '').split('.');
                        for (let index = 0; index < statusLogId.length; index++) {
                            const element = parseInt(statusLogId[index]);
                            if (statusIds.indexOf(element) !== -1) {
                                can = true;
                                break;
                            }
                        }
                    }
                    can ? next() : res.badRequest('No tienes acceso');
                });
            }
        }, err => res.badRequest(err));
    } else {
        res.badRequest('Falta modulo');
    }
};
