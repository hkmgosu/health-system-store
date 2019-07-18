/**
 * RemAccessController
 *
 * @description :: Server-side logic for managing RemAccess
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    get: function (req, res) {
        let idRem = req.body.idRem;
        if (!idRem) { return res.send({ ok: false }); }

        RemAccess.find({ rem: idRem }).populate('employee').then(
            remAccessList => res.send({ ok: true, obj: remAccessList }),
            err => res.send({ ok: false, obj: err })
        );
    },
    getEmployeeAccessList: (req, res) => {
        let idEmployee = req.body.idEmployee;
        let accessDate = new Date(req.body.accessDate);
        if (!idEmployee || !accessDate) { return res.badRequest(); }

        let moment = require('moment');

        RemAccess.find({
            employee: idEmployee,
            createdAt: {
                '>': moment(accessDate).startOf('day').toDate(),
                '<': moment(accessDate).endOf('day').toDate()
            }
        }).sort('id DESC').then(remAccessList => {
            async.forEach(remAccessList, (remAccess, cb) => {
                Rem.findOne(remAccess.rem)
                    .populate('callReason')
                    .populate('subCallReason')
                    .then(rem => {
                        remAccess.rem = rem;
                        cb();
                    }, cb);
            }, err => {
                if (err) { return res.serverError(err); }
                res.ok(remAccessList);
            });
        }, err => res.serverError(err));
    }
};

