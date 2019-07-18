/**
 * HealthCareController
 *
 * @description :: Server-side logic for managing Healthcares
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getAll: function (req, res) {
        HealthCare
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'HEALTHCARE.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'HEALTHCARE.SEARCH.FOUND',
                        obj: {
                            healthCares: data
                        }
                    });
                }
            });
    }
};

