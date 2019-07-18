/**
 * `generateProfiles`
 *
 * ---------------------------------------------------------------
 *
 * This is the default Grunt tasklist that will be executed if you
 * run `grunt` in the top level directory of your app.  It is also
 * called automatically when you start Sails in development mode using
 * `sails lift` or `node app`.
 *
 * Note that when lifting your app in a production environment (with the
 * `NODE_ENV` environment variable set to 'production') the `prod` task
 * will be run instead of this one.
 *
 * For more information see:
 *   http://sailsjs.org/documentation/anatomy/my-app/tasks/register/default-js
 *
 */
module.exports = function (grunt) {
    grunt.registerTask('generateProfiles', 'custom generate profiles', function () {
        var done = this.async();
        grunt.log.writeln('Generando profiles.json...');

        var fs = require('fs-extra');
        var _ = require('lodash');
        var async = require('async');

        var getModules = (rootDir) => new Promise((resolve, reject) => {
            fs.readJson(rootDir + '/module.json', (err, moduleObj) => {
                fs.readdir(rootDir, (err, files) => {
                    // Omitir module.json
                    _.remove(files, 'module.json');

                    if (_.isEmpty(files)) {
                        resolve(moduleObj);
                    } else {
                        moduleObj.modules = {};
                        async.forEach(files, (file, cb) => {
                            // Validar que sea un directorio
                            if (!fs.lstatSync(rootDir + '/' + file).isDirectory()) {
                                return async.setImmediate(cb);
                            }

                            // Obtener módulos
                            getModules(rootDir + '/' + file).then(obj => {
                                moduleObj.modules[file] = obj;
                                cb();
                            }, err => cb(err));
                        }, (err) => {
                            if (err) { return reject(); }
                            resolve(moduleObj);
                        });
                    }
                });
            });
        });

        getModules('./config/profiles/dashboards').then(obj => {
            fs.writeJson('.tmp/profiles.json', { dashboard: obj }, err => {
                if (err) grunt.log.writeln('Ha ocurrido un error: \n\n' + JSON.stringify(err));
                done();
            });
        });
    });
};