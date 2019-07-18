module.exports.cron = {
    notify: {
        schedule: '0 3 * * *',
        onTick: function () {

            // Se valida que solo la instancia 1 corra los cron
            if ((sails.config.globals || {}).pm_instance != 1) return;

            sails.log('Corriendo CronJob');

            var employees = [],
                tmpEmployee = {},
                moment = require('moment'),
                now = moment().startOf('day');
            RequestState
                .find({
                    finished: false
                })
                .exec(function (err, states) {
                    Request
                        .find({
                            state: _.map(states, 'id'),
                            employeeAssigned: {
                                '!': null
                            },
                            dueDate: {
                                '>': moment('01-01-2000', 'DD-MM-YYYY').toDate(),
                                '<': moment().add(3, 'days').toDate()
                            }
                        })
                        .populate('employeeAssigned')
                        .exec(function (err, requests) {
                            if (err || _.isEmpty(requests)) {
                                return;
                            }
                            requests.forEach(request => {
                                request.formattedDueDate = moment(request.dueDate).format('DD/MM/YY');
                                tmpEmployee = _.find(employees, {
                                    id: request.employeeAssigned.id
                                });
                                if (tmpEmployee) {
                                    tmpEmployee.requests.push(request);
                                } else {
                                    tmpEmployee = request.employeeAssigned;
                                    tmpEmployee.requests = [request];
                                    employees.push(tmpEmployee);
                                }
                            });
                            employees.forEach(function (e) {
                                e.vencidas = _.filter(e.requests, function (o) {
                                    return o.dueDate < now;
                                });
                                e.porVencer = _.filter(e.requests, function (o) {
                                    return o.dueDate > now;
                                });
                                if (e.vencidas.length > 0 || e.porVencer.length > 0) {
                                    var title = "<span>Tienes ";
                                    if (e.vencidas.length > 0) {
                                        title = title + "<b>" + e.vencidas.length + "</b> solicitudes vencidas";
                                    }
                                    if (e.vencidas.length > 0 && e.porVencer > 0) {
                                        title = title + " y ";
                                    }
                                    if (e.porVencer.length > 0) {
                                        title = title + "<b>" + e.porVencer.length + "</b> solicitudes por vencer";
                                    }
                                    title = title + "</span>";
                                    Notification
                                        .create({
                                            title: title,
                                            assignedTo: e.id
                                        })
                                        .exec(function (err, notification) {
                                            if (err || !notification) {
                                                sails.log(err);
                                            } else {
                                                sails.log(
                                                    "Enviando notificación a " + e.name,
                                                    e.vencidas.length + " vencidas y " + e.porVencer.length + " por vencer");
                                                if (e.email) {
                                                    EmailService.sendRequestReminder(
                                                        e,
                                                        e.vencidas,
                                                        e.porVencer,
                                                        notification.title
                                                    );
                                                }
                                            }
                                        });
                                }
                            });
                        });
                });
        },
        start: true
    },
    cleanFiles: {
        schedule: '0 3 * * *',
        onTick: function () {

            // Se valida que solo la instancia 1 corra los cron
            if ((sails.config.globals || {}).pm_instance != 1) return;

            var fs = require('fs-extra');
            Archive.find({
                deleted: false,
                valid: false
            }).exec(function (err, data) {
                if (err || !data) {
                    return false;
                }
                // Eliminar archivos físicos
                data.forEach(file => {
                    fs.remove(file.fileFd, (err) => {
                        if (err) {
                            return console.error(err);
                        }
                        console.log('Se eliminó archivo' + file.fileFd);
                    });
                });
                // Actualizar registro
                Archive
                    .update(_.map(data, 'id'), {
                        deleted: true
                    })
                    .exec(function (err, data) { });
            });
        },
        start: true
    },
    stockNotify: {
        schedule: '0 3 * * *',
        onTick: function () {

            // Se valida que solo la instancia 1 corra los cron
            if ((sails.config.globals || {}).pm_instance != 1) return;

            let moment = require('moment');
            sails.log("stockNotify", moment().format('MMMM Do YYYY, h:mm:ss a'));
            Unit.find({
                storage: true,
                deleted: false
            }).then(units => {
                sails.log.info("storage units: ", _.map(units, "id"));
                Product.query("select * from get_report_critical_stock($1, $2, $3, $4, $5)", [_.map(units, "id"), null, null, null, null], (err, results) => {
                    if (err) sails.log.warn("error al buscar stock critico", err);

                    if (results.rows && results.rows.length > 0) {
                        sails.log.info("critical stock results: \n", results.rows.length);
                        EmailService.sendCriticalStockNotification(results.rows);
                    } else {
                        sails.log.info("sin stock crítico");
                    }
                });
            }, err => sails.log.warn("ERROR STOCKNOTIFY", err));
        },
        start: true
    },

};