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
            if (req.session.employee.can.view.indexOf(req.path) !== -1) {
                return next();
            }
            if (req.session.employee.can.view.length > 0) {
                return res.redirect(req.session.employee.can.view[0]);
            } else {
                sails.log('Error no tienen vista asociada', req.session.employee);
                req.session.authenticated = false;
                req.session.employee = undefined;
                return res.forbidden();
            }
        }
    }
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    //return res.forbidden('You are not permitted to perform this action.');

    var loginView = sails.config.login[''];
    if (loginView) {
        var readJson = require('read-package-json');

        // readJson(filename, [logFunction=noop], [strict=false], cb)
        readJson('./package.json', console.error, false, function (er, packageJson) {
            if (er) {
                console.error("There was an error reading the file")
                return
            }
            return res.view(loginView, {
                layout     : null,
                appVersion : packageJson.version,
                environment: sails.config.environment
            });
        });
    } else {
        return res.notFound();
    }
};
