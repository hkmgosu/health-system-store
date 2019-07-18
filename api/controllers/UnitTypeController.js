/**
 * UnitTypeController
 *
 * @description :: Server-side logic for managing unittypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getAll: function (req, res) {
        UnitType
            .find({ deleted: false })
            .exec(function (err, unitTypes) {
                if (err) {
                    return res.send({ ok: false, msj: 'UNITTYPE.SEARCH.ERROR', obj: err });
                } else {
                    return res.send({ ok: true, msj: 'UNITTYPE.SEARCH.SUCCESS', obj: unitTypes });
                }
            });
    }
};

