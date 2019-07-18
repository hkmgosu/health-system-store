/**
 * HolidayController
 *
 * @description :: Server-side logic for managing Holiday
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    importsHolidays: (req, res) => {
        const request = require('request-promise');
        const config = sails.config.imports.holidays;
        request({
            method: 'GET',
            uri: config.url,
            json: true
        }).then(response => {
            async.eachLimit(response.data || [], 500, (holiday, cb) => {
                if (!holiday.date) {
                    return cb('fecha no válida');
                }
                holiday.lawId = holiday.law_id;
                _.map(holiday.lawId, law => {
                    holiday.validDate !== false ? holiday.validDate = !(config.notApply.includes(law)) : null;
                });
                Holiday
                    .findOne({ date: holiday.date })
                    .exec((err, holidayData) => {
                        if (err) return cb(err);
                        else {
                            if (holidayData) {
                                Holiday
                                    .update(holidayData.id, _.omit(holiday, 'id'))
                                    .exec(err => err ? cb(err) : cb());
                            } else {
                                Holiday
                                    .create(_.omit(holiday, 'id'))
                                    .exec(err => err ? cb(err) : cb());
                            }
                        }
                    })
            }, err => err ? console.log(err) : console.log('Carga de feriados cargada con éxito')
            );
        }).catch(err => sails.log(err));

        res.ok({ ok: true, msj: 'Trabajando...' });
    },
    initHoliday: (req, res) => {
        var xlsx = require('xlsx');
        var moment = require('moment');
        var imports = sails.config.imports.holidays;
        var workbook = xlsx.readFile(imports.filePath);
        var holidays = xlsx.utils.sheet_to_json(workbook.Sheets[imports.excelSheet.holidays]);

        async.eachLimit(holidays || [], 500, (holiday, cb) => {
            if (holiday.date) {
                let date = moment(holiday.date, 'YYYY-MM-DD');
                if (date.isValid()) holiday.date = date.toDate();
                else return cb('fecha inválida');
            } else {
                return cb('fecha inválida');
            }
            holiday.law = _.map(holiday.law.split(','), _.trim);
            holiday.validDate = true;
            Holiday
                .findOne({ date: holiday.date })
                .exec((err, holidayData) => {
                    if (err) return cb(err);
                    else {
                        if (holidayData) {
                            Holiday
                                .update(holidayData.id, _.omit(holiday, 'id'))
                                .exec(err => err ? cb(err) : cb());
                        } else {
                            Holiday
                                .create(_.omit(holiday, 'id'))
                                .exec(err => err ? cb(err) : cb());
                        }
                    }
                })
        }, err => {
            if (err) return res.negotiate(err);
            else return res.ok('Proceso finalizado');
        });
    },
    getHolidays: (req, res) => {
        if (!req.body.from || !req.body.until) return res.negotiate('Faltan datos');
        Holiday
            .find({
                validDate: true,
                date: {
                    '>=': new Date(req.body.from), '<=': new Date(req.body.until)
                }
            })
            .then((holidays, err) => {
                if (err) return res.negotiate(err);
                else return res.ok(holidays);
            });
    }
};