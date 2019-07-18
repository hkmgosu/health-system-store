/**
 * RemAttentionController
 *
 * @description :: Server-side logic for managing Remattentions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
	/**
     * Guarda o actualiza una clase de atención
     */
    saveClass: (req, res) => {
        var attentionClass = req.body.attentionClass;
        if (attentionClass.id) {
            AttentionClass.update(attentionClass.id, attentionClass).exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'ATTENTIONCLASS.ERROR.UPDATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'ATTENTIONCLASS.SUCCESS.SAVE', obj: { attentionClass: data[0] } });
                }
            });
        } else {
            AttentionClass.create(attentionClass).exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'ATTENTIONCLASS.ERROR.CREATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'ATTENTIONCLASS.SUCCESS.SAVE', obj: { attentionClass: data } });
                }
            });
        }
    },
    /**
     * Guarda o actualiza un item de atención
     */
    saveItem: (req, res) => {
        var attentionItem = req.body.attentionItem;
        if (attentionItem.id) {
            AttentionItem.update(attentionItem.id, attentionItem).exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'ATTENTIONITEM.ERROR.UPDATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'ATTENTIONITEM.SUCCESS.SAVE', obj: { attentionItem: data[0] } });
                }
            });
        } else {
            AttentionItem.create(attentionItem).exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'ATTENTIONITEM.ERROR.CREATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'ATTENTIONITEM.SUCCESS.SAVE', obj: { attentionItem: data } });
                }
            });
        }
    },
    /**
     * Obtiene clases de atención de acuerdo a criterios
     */
    getClasses: (req, res) => {
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
                AttentionClass
                    .count(filter)
                    .exec(cb);
            },
            data: (cb) => {
                AttentionClass
                    .find(filter)
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || 10 })
                    .exec((err, data) => {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, { attentionClasses: data });
                        }
                    });
            }
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: err });
            } else {
                return res.send({ ok: true, obj: { attentionClasses: results.data.attentionClasses || [], found: results.count } });
            }
        });
    },
    /**
     * Obtiene item de atención de acuerdo a criterios
     */
    getItems: (req, res) => {
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
                AttentionItem
                    .count(filter)
                    .exec(cb);
            },
            data: (cb) => {
                AttentionItem
                    .find(filter)
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || 10 })
                    .exec((err, data) => {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, { attentionItems: data });
                        }
                    });
            }
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: err });
            } else {
                return res.send({ ok: true, obj: { attentionItems: results.data.attentionItems || [], found: results.count } });
            }
        });
    },
    /**
     * Borra una clase de atención
     */
    deleteClass: (req, res) => {
        AttentionClass.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec((err, data) => {
                if (err) {
                    sails.log(err);
                    return res.send({ msg: 'ATTENTIONCLASS.ERROR.DELETE', ok: false, obj: { error: err } });
                } else {
                    sails.log('deleteClass - Eliminado id: ' + data[0].id);
                    return res.send({ msg: 'ATTENTIONCLASS.SUCCESS.DELETE', ok: true });
                }
            });
    },
    /**
     * Borra un item de atención
     */
    deleteItem: (req, res) => {
        AttentionItem.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec((err, data) => {
                if (err) {
                    sails.log(err);
                    return res.send({ msg: 'ATTENTIONITEM.ERROR.DELETE', ok: false, obj: { error: err } });
                } else {
                    sails.log('deleteItem - Eliminado id: ' + data[0].id);
                    return res.send({ msg: 'ATTENTIONITEM.SUCCESS.DELETE', ok: true });
                }
            });
    },
    /**
     * Obtiene todas las clases de atención
     */
    getAllClasses: (req, res) => {
        if (req.body.populate) {
            AttentionClass
                .find({ deleted: false })
                .populate('items')
                .exec((err, data) => {
                    if (err) {
                        return res.send({ ok: false, msg: 'ATTENTIONCLASS.SEARCH.ERROR', obj: {} });
                    } else {
                        return res.send({ ok: true, msg: 'ATTENTIONCLASS.SEARCH.FOUND', obj: { attentionClasses: data } });
                    }
                });
        } else {
            AttentionClass
                .find({ deleted: false })
                .exec((err, data) => {
                    if (err) {
                        return res.send({ ok: false, msg: 'ATTENTIONCLASS.SEARCH.ERROR', obj: {} });
                    } else {
                        return res.send({ ok: true, msg: 'ATTENTIONCLASS.SEARCH.FOUND', obj: { attentionClasses: data } });
                    }
                });
        }
    },
    /**
     * Obtiene todos los items de atención
     */
    getAllItems: (req, res) => {
        if (req.body.populate) {
            AttentionItem
                .find({ deleted: false })
                .populate('class')
                .exec((err, data) => {
                    if (err) {
                        return res.send({ ok: false, msg: 'ATTENTIONITEM.SEARCH.ERROR', obj: {} });
                    } else {
                        return res.send({ ok: true, msg: 'ATTENTIONITEM.SEARCH.FOUND', obj: { attentionItems: data } });
                    }
                });
        } else {
            AttentionItem
                .find({ deleted: false })
                .exec((err, data) => {
                    if (err) {
                        return res.send({ ok: false, msg: 'ATTENTIONITEM.SEARCH.ERROR', obj: {} });
                    } else {
                        return res.send({ ok: true, msg: 'ATTENTIONITEM.SEARCH.FOUND', obj: { attentionItems: data } });
                    }
                });
        }
    },
    getRemPatientAttentions: (req, res) => {
        AttentionProvided
            .find({ remPatient: req.body.remPatient, deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'ATTENTIONCLASS.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'ATTENTIONCLASS.SEARCH.FOUND', obj: { setAttentions: data } });
                }
            });
    }
};

