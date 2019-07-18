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

    // User is allowed, proceed to the next policy, 
    // or if this is the last policy, the controller
    if (req.session.authenticated) {
        if (req.session.employee) {
            var toFind = req.options.controller + '.' + req.options.action;
            var canCreate = req.session.employee.can.create;
            if (canCreate.indexOf(req.options.controller + '.*') !== -1 || canCreate.indexOf(toFind) !== -1) {
                return next();
            } else {
                return res.forbidden({ok: false, msg:'Permission denied'},{},true);
            }
        }
    }
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    //return res.forbidden('You are not permitted to perform this action.');
    return res.forbidden({ok: false, reload: true, msg:'Not authenticated'},{},true);
};
