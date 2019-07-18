/**
 * RegionController
 *
 * @description :: Server-side logic for managing units
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getAll: function (req, res) {
        Region
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'REGION.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'REGION.SEARCH.FOUND', obj: { region: data } });
                }
            });
    }
};

