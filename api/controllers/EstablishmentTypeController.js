/**
 * EstablishmentTypeController
 *
 * @description :: Server-side logic for managing establishmenttypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getAll: function (req, res) {
        EstablishmentType
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'ESTABLISHMENTTYPE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'ESTABLISHMENTTYPE.SEARCH.FOUND', obj: data });
                }
            });
    },
    getAllPublic: function (req, res) {
        EstablishmentType
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'ESTABLISHMENTTYPE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'ESTABLISHMENTTYPE.SEARCH.FOUND', obj: data });
                }
            });
    },
    uploadIcon: function (req, res) {
        var fse = require('fs-extra');
        var dir = '.tmp/uploads/' + new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/';
        fse.ensureDirSync(dir);
        req.file('file').upload({
            dirname: new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/',
            maxBytes: 10000000
        }, function (err, filesUploaded) {
            if (err) return res.negotiate(err);
            if (filesUploaded.length === 0) {
                return res.badRequest('No file was uploaded');
            }
            EstablishmentType.update(req.body.id, {
                iconFd: filesUploaded[0].fd,
                hasIcon: true
            })
                .exec(function (err, data) {
                    if (err) {
                        return res.send({ ok: false, msg: 'ESTABLISHMENTTYPE.ERROR.UPDATE', obj: err });
                    } else {
                        return res.send({ ok: true, msg: 'ESTABLISHMENTTYPE.SUCCESS.SAVE', obj: {} });
                    }
                });
        });
    },
    icon: function (req, res) {
        if (req.allParams().id) {
            EstablishmentType
                .findOne(req.allParams().id)
                .exec(function (err, data) {
                    if (err) return res.negotiate(err);
                    if (!data) return res.notFound();
                    if (!data.iconFd) {
                        return res.notFound();
                    }

                    var SkipperDisk = require('skipper-disk');
                    var fileAdapter = SkipperDisk();

                    res.set('Content-disposition', 'attachment; filename="' + 'Foto' + '"');
                    fileAdapter.read(data.iconFd)
                        .on('error', function (err) {
                            return res.notFound();
                        })
                        .pipe(res);
                });
        } else {
            return res.notFound();
        }
    },
    iconPublic: function (req, res) {
        if (req.allParams().id) {
            EstablishmentType
                .findOne(req.allParams().id)
                .exec(function (err, data) {
                    if (err) return res.negotiate(err);
                    if (!data) return res.notFound();
                    if (!data.iconFd) {
                        return res.notFound();
                    }

                    var SkipperDisk = require('skipper-disk');
                    var fileAdapter = SkipperDisk();

                    res.set('Content-disposition', 'attachment; filename="' + 'Foto' + '"');
                    fileAdapter.read(data.iconFd)
                        .on('error', function (err) {
                            return res.serverError(err);
                        })
                        .pipe(res);
                });
        } else {
            return res.notFound();
        }
    },
    save: function (req, res) {
        var establishmentType = req.body.establishmentType;
        if (establishmentType.id) {
            EstablishmentType.update(establishmentType.id, establishmentType).exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'ESTABLISHMENTTYPE.ERROR.UPDATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'ESTABLISHMENTTYPE.SUCCESS.SAVE', obj: { establishmentType: data[0] } });
                }
            });
        } else {
            EstablishmentType.create(establishmentType).exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'ESTABLISHMENTTYPE.ERROR.CREATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'ESTABLISHMENTTYPE.SUCCESS.SAVE', obj: { establishmentType: data } });
                }
            });
        }
    },
    /**
     * Marca como eliminado un Packet
     * 
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    delete: function (req, res) {
        EstablishmentType.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec(function (err, data) {
                if (err) {
                    return res.send({ msg: 'ESTABLISHMENTTYPE.ERROR.DELETE', ok: false, obj: { error: err } });
                } else {
                    return res.send({ msg: 'ESTABLISHMENTTYPE.SUCCESS.DELETE', ok: true });
                }
            });
    },
    get: function (req, res) {
        var filter = {
            deleted: false,
            name: { 'contains': req.body.filter || '' }
        };
        EstablishmentType
            .count(filter)
            .exec(function (error, found) {
                EstablishmentType
                    .find(filter)
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || found })
                    .exec(function (err, data) {
                        if (err) {
                            sails.log('error:', err);
                            return res.send({ ok: false, obj: {} });
                        } else {
                            return res.send({ ok: true, obj: { establishmentTypes: data, found: found } });
                        }
                    });
            });
    }
};

