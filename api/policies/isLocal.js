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
//    sails.log("host:", req.host);
    if (req.ip !== '::1') {
        return res.forbidden('You are not permitted to perform this action.');
    }
    return next();
};
