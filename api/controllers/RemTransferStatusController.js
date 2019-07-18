/**
 * RemTransferStatusController
 *
 * @description :: Server-side logic for managing remtransferstatuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    /**
     * Obtiene estados de traslado de acuerdo a criterios
     */
    get: (req, res) => {
        /**
         * Filtro de búsqueda
         */
        var filter = {
            or: [
                { name: { 'contains': req.body.filter || '' } }
            ],
            deleted: false
        };
        async.parallel({
            count: (cb) => {
                TransferStatus
                    .count(filter)
                    .exec(cb);
            },
            data: (cb) => {
                TransferStatus
                    .find(filter)
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || 10 })
                    .exec((err, data) => {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, { transferStatus: data });
                        }
                    });
            }
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: err });
            } else {
                return res.send({ ok: true, obj: { transferStatus: results.data.transferStatus || [], found: results.count } });
            }
        });
    },
    /**
     * Obtiene todos los estados de traslado
     */
    getAll: (req, res) => {
        TransferStatus
            .find({ deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'TRANSFERSTATUS.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'TRANSFERSTATUS.SEARCH.FOUND', obj: { transferStatus: data } });
                }
            });
    },
    /**
     * Guarda o actualiza un estado de traslado
     */
    save: (req, res) => {
        var transferStatus = req.body.transferStatus;
        if (transferStatus.id) {
            TransferStatus.update(transferStatus.id, transferStatus).exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'TRANSFERSTATUS.ERROR.UPDATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'TRANSFERSTATUS.SUCCESS.SAVE', obj: { transferStatus: data[0] } });
                }
            });
        } else {
            TransferStatus.create(transferStatus).exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'TRANSFERSTATUS.ERROR.CREATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'TRANSFERSTATUS.SUCCESS.SAVE', obj: { transferStatus: data } });
                }
            });
        }
    },
    /**
     * Borra un estado de traslado
     */
    delete: (req, res) => {
        TransferStatus.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec((err, data) => {
                if (err) {
                    sails.log(err);
                    return res.send({ msg: 'TRANSFERSTATUS.ERROR.DELETE', ok: false, obj: { error: err } });
                } else {
                    sails.log('deleteTrasnferStatus - Eliminado id: ' + data[0].id);
                    return res.send({ msg: 'TRANSFERSTATUS.SUCCESS.DELETE', ok: true });
                }
            });
    }
};

