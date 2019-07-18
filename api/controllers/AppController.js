/**
 * AppController
 *
 * @description :: Server-side logic for managing apps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    showDashboards: function (req, res) {
        var readJson = require('read-package-json');

        // readJson(filename, [logFunction=noop], [strict=false], cb)
        readJson('./package.json', console.error, false, function (er, packageJson) {
            if (er) {
                console.error("There was an error reading the file")
                return
            }
            res.view('dashboards/index', {
                layout: null,
                modulesPrivileges: req.session.employee.profile.profiles.dashboard || {},
                employee: _.omit(req.session.employee, ['password', 'profile', 'can', 'profiles', 'profileList']) || {},
                appVersion: packageJson.version || '',
                environment: sails.config.environment,
                intranetPath: sails.config.path.intranet
            });
        });
    },
    showPublic: function (req, res) {
        var readJson = require('read-package-json');

        // readJson(filename, [logFunction=noop], [strict=false], cb)
        readJson('./package.json', console.error, false, function (er, packageJson) {
            if (er) {
                console.error("There was an error reading the file")
                return
            }
            res.view('public/index', {
                layout: null,
                employee: _.pick(req.session.employee, ['id', 'hasProfilePicture', 'fullname']) || {},
                appVersion: packageJson.version || '',
                environment: sails.config.environment
            });
        });

    }
};

