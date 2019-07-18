/**
 * DerivationStatusController
 *
 * @description :: Server-side logic for managing derivations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

module.exports = {
    getList: (req, res) => {
        DerivationStatus.find({ deleted: false }).then(
            derivationStatusList => res.send({ ok: true, obj: derivationStatusList }),
            err => res.send({ ok: false, obj: err })
        );
    },
    init: (req, res) => {
        DerivationStatus.destroy({}).then(() => {
            DerivationStatus.create([{
                id: 1,
                finished: false,
                name: 'Ingresada'
            }, {
                id: 2,
                finished: true,
                name: 'Aceptado'
            }, {
                id: 3,
                finished: true,
                name: 'Rechazado'
            }, {
                id: 4,
                finished: true,
                name: 'Cancelado'
            }]).then(derivationStatusList => res.send({ ok: true, obj: derivationStatusList }));
        });
    }
};

