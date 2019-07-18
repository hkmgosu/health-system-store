/**
 * JobController
 *
 * @description :: Server-side logic for managing Jobs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    get: function (req, res) {
        var filter = {
            deleted: false,
            name: { 'contains': req.body.filter || '' }
        };
        Job
            .count(filter)
            .exec(function countCB(error, found) {
                Job
                    .find(filter)
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || found })
                    .exec(function (err, jobs) {
                        if (err) {
                            sails.log('error:', err);
                            return res.send({ ok: false, obj: {} });
                        } else {
                            return res.send({ ok: true, obj: { jobs: jobs, found: found } });
                        }
                    });
            });
    },
    getAll: function (req, res) {
        Job
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'JOB.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'JOB.SEARCH.FOUND', obj: data });
                }
            });
    },
    save: function (req, res) {
        var job = req.body.job;
        if (job.id) {
            Job.update(job.id, job).exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'JOB.ERROR.UPDATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'JOB.SUCCESS.SAVE', obj: data[0] });
                }
            });
        } else {
            Job.create(job).exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'JOB.ERROR.CREATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'JOB.SUCCESS.SAVE', obj: data });
                }
            });
        }
    },
    delete: function (req, res) {
        Job.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec(function (err, data) {
                if (err) {
                    sails.log(err);
                    return res.send({ msg: 'JOB.ERROR.DELETE', ok: false, obj: { error: err } });
                } else {
                    sails.log(Job);
                    return res.send({ msg: 'JOB.SUCCESS.DELETE', ok: true });
                }
            });
    }
};

