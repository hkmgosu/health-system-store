/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

'use strict';

module.exports.bootstrap = function (cb) {
    // return cb(); // solo para sails console

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

    var fs = require('fs-extra');
    var process = require('process');

    /**
     * Función que obtiene ultimos logs y los envia por correo a usuarios admin
     */
    var sendRestartServer = () => {
        try {
            var pm2 = require('pm2');
            var AU = require('ansi_up');
            pm2.connect(true, function (err) {
                if (err) sails.log(err);
                else {
                    pm2.describe('app', function (err, proc) {
                        if (err) sails.log(err);
                        else {
                            if (proc.length > 0) {
                                var pathLog, fileLog, since, textLog, htmlLog;
                                _.map(proc, instance => {
                                    if (process.pid === instance.pid) {
                                        pathLog = instance.pm2_env.pm_err_log_path;
                                        fileLog = fs.readFileSync(pathLog);
                                        sails.config.globals.pm_instance = instance.pm_id;
                                        if (fileLog) {
                                            since = fileLog.length < 3000 ? 0 : fileLog.length - 3000;
                                            textLog = fileLog.toString('utf-8', since, fileLog.length);
                                            htmlLog = AU.ansi_to_html(textLog);
                                            EmailService.sendRestartServer(instance.pm_id, htmlLog);
                                        }
                                    }
                                })
                            }
                        }
                    });
                }
            });
        } catch (e) {
            sails.log(e);
        }
    };

    sendRestartServer();

    cb();
};