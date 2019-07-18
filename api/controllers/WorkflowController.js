/**
 * WorkflowController
 *
 * @description :: Server-side logic for managing viatics
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getStatus: (req, res) => {
        var filter = {
            deleted: false
        };
        req.body.module ? filter.module = req.body.module : null;
        if (req.body.getSupervisors) {
            WorkflowStatus
                .find(filter)
                .populate('supervisors')
                .then(status => res.ok({ status: status }))
                .catch(err => res.negotiate(err));
        } else {
            WorkflowStatus
                .find(filter)
                .then(status => res.ok({ status: status }))
                .catch(err => res.negotiate(err));
        }
    },
    getEnabledStatusList: (req, res) => {
        let { id, module } = req.body;
        WorkflowService.getEnabledStatusList(id, module, req.session.employee.id).then(
            statusList => _.isEmpty(statusList) ? res.badRequest() : res.ok(statusList),
            err => res.badRequest()
        );
    },
    addSupervisor: (req, res) => {
        let idEmployee = req.body.employee;
        let idStatus = req.body.status;
        if (!idStatus || !idEmployee) {
            return res.send({ ok: false, msg: 'WORKFLOW.SAVE.ERROR', obj: [] });
        }
        WorkflowStatus.findOne(idStatus).populate('supervisors').then(status => {
            status.supervisors.add(idEmployee);
            status.supervisorsCount = status.supervisors.length + 1;
            status.save(
                err => {
                    if (err) {
                        sails.log(err);
                        res.send({ ok: false, msg: 'WORKFLOW.SAVE.ERROR', obj: [] });
                    } else {
                        res.send({ ok: true, msg: 'WORKFLOW.SAVE.SUCCESS', obj: [] });
                    }
                }
            );
        });
    },
    rmSupervisor: (req, res) => {
        let idEmployee = req.body.employee;
        let idStatus = req.body.status;
        if (!idStatus || !idEmployee) {
            return res.send({ ok: false, msg: 'WORKFLOW.SAVE.ERROR', obj: [] });
        }
        WorkflowStatus.findOne(idStatus).populate('supervisors').then(status => {
            status.supervisors.remove(idEmployee);
            status.supervisorsCount = status.supervisors.length - 1;
            status.save(
                err => {
                    if (err) {
                        sails.log(err);
                        res.send({ ok: false, msg: 'WORKFLOW.SAVE.ERROR', obj: [] });
                    } else {
                        res.send({ ok: true, msg: 'WORKFLOW.SAVE.SUCCESS', obj: [] });
                    }
                }
            );
        });
    },
    canCreate: (req, res) => {
        if (!req.session.employee.level) {
            return res.serverError('Usuario sin grado registrado');
        }
        WorkflowService.getReportedUnit(req.session.employee).then(
            unit => res.ok(),
            () => res.serverError('Unidad de reporte no encontrada')
        );
    },
    /**
     * Iniciar estados del workflow
     */
    initStatus: (req, res) => {
        var xlsx = require('xlsx');
        var imports = sails.config.imports.workflow;
        var workbook = xlsx.readFile(imports.filePath);
        var status = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.status]);

        _.forEach(status, data => {
            data.isSupervised = data.isSupervised && data.isSupervised === 'TRUE' ? true : false;
            data.from = data.from ? data.from.split(',') : null;
        });

        WorkflowStatus.destroy({}).exec(err => {
            if (err) {
                return res.negotiate({ msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
            } else {
                WorkflowStatus.create(status).exec((err, statusCreated) => {
                    if (err) {
                        return res.negotiate({ msg: 'ADVERSEEVENT.ERROR.CREATE', obj: err });
                    } else {
                        return res.ok({ msg: 'ADVERSEEVENT.SUCCESS.CREATE', obj: statusCreated });
                    }
                });
            }
        });
    },
    getUnitReported: (req, res) => {
        let { idEmployee } = req.body;
        Employee.findOne(idEmployee).then(employee => {
            WorkflowService.getReportedUnit(employee).then(unit => {
                res.ok(unit);
            }, err => res.serverError(err));
        });
    }
};
