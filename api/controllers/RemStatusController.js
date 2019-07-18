/**
 * RemPatientController
 *
 * @description :: Server-side logic for managing rempatient
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    create: (req, res) => {
        let { status } = req.body;
        if (_.isEmpty(status)) { return res.badRequest(); }
        RemStatus.create(status).then((statusCreated) => {
            res.ok(statusCreated);
        });
    },
    getSupervisorList: (req, res) => {
        let { idStatus } = req.body;
        RemStatusSupervisor.find({ status: idStatus }).populate('job').then(list => {
            res.ok(list.map(item => { return item.job; }));
        }, err => res.serverError(err));
    },
    // Asociar un cargo al estado seleccionado
    addSupervisor: (req, res) => {
        let { idStatus, idJob } = req.body;
        RemStatusSupervisor.create({
            status: idStatus,
            job: idJob
        }).then(supervisorCreated => {
            res.ok(supervisorCreated);
        }, err => res.serverError(err));
    },
    // Desasociar un cargo al estado seleccionado
    removeSupervisor: (req, res) => {
        let { idStatus, idJob } = req.body;
        RemStatusSupervisor.destroy({
            status: idStatus,
            job: idJob
        }).then(() => {
            res.ok();
        }, err => res.serverError(err));
    },
    updateOrder: (req, res) => {
        let { statusList } = req.body;
        if (_.isEmpty(statusList)) { return res.badRequest(); }
        let promiseList = statusList.map(status => RemStatus.update(status.id, _.pick(status, 'order')));
        Promise.all(promiseList).then(() => res.ok(), err => res.serverError(err));
    }
};