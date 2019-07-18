/**
 * AreaController
 *
 * @description :: Server-side logic for managing areas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    save: function (req, res) {
        var _ = require('underscore');
        if (req.body.area.id) {
            if (_.isUndefined(req.body.area.id)) {
                return res.send({
                    ok: false,
                    msg: 'AREA.ERROR.INVALIDID',
                    obj: {}
                });
            }
            Area
                .update(req.body.area.id, req.body.area)
                .exec(function (err, areas) {
                    if (err) {
                        sails.log(err);
                        return res.send({
                            ok: false,
                            msg: 'AREA.ERROR.UPDATE',
                            obj: err
                        });
                    } else {
                        return res.send({
                            ok: true,
                            isNew: false,
                            msg: 'AREA.SUCCESS.UPDATE',
                            obj: areas[0]
                        });
                    }
                });
        } else {
            Area.create(req.body.area).exec(function (err, area) {
                if (err) {
                    sails.log(err);
                    return res.send({
                        ok: false,
                        msg: 'AREA.ERROR.CREATE',
                        obj: err
                    });
                } else {
                    return res.send({
                        ok: true,
                        isNew: true,
                        msg: 'AREA.SUCCESS.CREATE',
                        obj: area
                    });
                }
            });
        }
    },
    getAll: function (req, res) {
        Area.find().where({ deleted: false }).exec(function (err, areas) {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: {} });
            } else {
                return res.send({ ok: true, obj: areas });
            }
        });
    },
    getAllPublic: function (req, res) {
        Area.find().where({ deleted: false, isPublic: true }).exec(function (err, areaList) {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: {} });
            } else {
                return res.send({ ok: true, obj: areaList });
            }
        });
    },
    delete: function (req, res) {
        if (!req.body.id) {
            var msg = { msg: 'AREA.ERROR.INVALIDID', ok: false };
            return res.send(msg);
        }
        Area.
            update({ id: req.body.id }, { deleted: true })
            .exec(function (err, vehicle) {
                if (err) {
                    sails.log(err);
                    var msg = {
                        msg: 'AREA.ERROR.DELETE',
                        ok: false,
                        obj: {
                            error: err
                        }
                    };
                    return res.send(msg);
                } else {
                    sails.log(vehicle);
                    var msg = { msg: 'AREA.SUCCESS.DELETE', ok: true };
                    return res.send(msg);
                }
            });
    }
};

