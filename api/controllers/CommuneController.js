/**
 * CommuneController
 *
 * @description :: Server-side logic for managing communes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';
module.exports = {
    getAll: function (req, res) {
        Commune
            .find({ region: req.body.region })
            .sort('name ASC')
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'COMMUNE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'COMMUNE.SEARCH.FOUND', obj: { commune: data } });
                }
            });
    },
    getAutocomplete: (req, res) => {
        let searchText = req.body.searchText || '';
        Commune
            .find({
                name: { contains: searchText },
                deleted: false
            })
            .limit(10)
            .then(communes => res.send({ ok: true, obj: communes }))
            .catch(err => res.send({ ok: false, obj: err }));
    },
    get: (req, res) => {
        let searchText = req.body.searchText;
        if (!searchText) { return res.send({ ok: false }) }
        Commune.findOne({
            name: searchText,
            deleted: false
        }).then(
            commune => res.send({ ok: !_.isEmpty(commune), obj: commune }),
            err => res.send({ ok: false, obj: err })
        );
    }
};