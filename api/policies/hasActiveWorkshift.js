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
    let now = new Date();
    let moment = require('moment');

    async.series({
        validatedWorkshift: cb => {
            let workshift = req.session.workshift;
            if (
                workshift &&
                new Date(workshift.endTime) > moment(now).subtract(1, 'h').toDate() &&
                new Date(workshift.validatedTime) > moment(now).subtract(5, 'm')
            ) { return cb(null, workshift); }

            Workshift.find({
                startTime: { '<': moment(now).add(1, 'h').toDate() },
                endTime: { '>': moment(now).subtract(1, 'h').toDate() },
                deleted: false
            }).then(workshiftList => {
                if (_.isEmpty(workshiftList)) { return cb(); }
                Participant.findOne({
                    workshift: _.map(workshiftList, 'id'),
                    member: req.session.employee.id,
                    deleted: false
                }).then((participant) => {
                    if (_.isEmpty(participant)) { return cb(); }
                    let workshiftFinded = _.find(workshiftList, { id: participant.workshift });
                    workshiftFinded.validatedTime = now;
                    cb(null, workshiftFinded);
                }, cb);
            }, cb);
        }
    }, (err, results) => {
        if (err) { sails.log(err); }

        req.session.workshift = results.validatedWorkshift;

        if (req.session.workshift || req.session.employee.samuFullAccess) {
            next();
        } else {
            res.badRequest('Require Active Workshift');
        }
    });
};
