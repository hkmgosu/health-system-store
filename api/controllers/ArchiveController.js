/**
 * ArchiveController
 *
 * @description :: Server-side logic for managing Archives
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    uploadArchive: function (req, res) {
        var fse = require('fs-extra');
        var uuidV4 = require('uuid/v4');
        var date = new Date().getFullYear() + '/' +
            new Date().getMonth() + '/' +
            new Date().getDate() + '/';
        var dir = '.tmp/uploads/' + date;
        var nameHash = uuidV4();
        var nameFile;
        fse.ensureDirSync(dir);

        req.file('file').upload({
            saveAs: function (__newFileStream, cb) {
                nameFile = nameHash + '.' +
                    __newFileStream.filename.split('.').pop();
                cb(null, nameFile);
            },
            dirname: date,
            maxBytes: 10000000
        }, function (err, filesUploaded) {
            if (err) {
                fse.removeSync(dir + nameFile);
                return res.send({ ok: false });
            }
            if (filesUploaded.length === 0) {
                return res.badRequest('No file was uploaded');
            }
            Archive.create({
                owner: req.session.employee.id,
                fileFd: filesUploaded[0].fd,
                name: filesUploaded[0].filename,
                size: filesUploaded[0].size,
                mimeType: filesUploaded[0].type
            })
                .exec(function (err, data) {
                    if (err) {
                        return res.send({
                            ok: false,
                            msg: 'ARCHIVE.ERROR.UPDATE',
                            obj: err
                        });
                    } else {
                        return res.send({
                            ok: true,
                            msg: 'ARCHIVE.SUCCESS.SAVE',
                            obj: {
                                id: data.id
                            }
                        });
                    }
                });
        });
    },
    delete: function (req, res) {
        Archive.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec(function (err, data) {
                if (err) {
                    return res.send({
                        msg: 'ARCHIVE.ERROR.DELETE',
                        ok: false,
                        obj: {
                            error: err
                        }
                    });
                } else {
                    return res.send({
                        msg: 'ARCHIVE.SUCCESS.DELETE',
                        ok: true
                    });
                }
            });
    },
    attachment: function (req, res) {
        var params = req.allParams();

        var returnArchive = function (id, inline) {
            Archive
                .findOne(id)
                .exec(function (err, data) {
                    if (err) return res.negotiate(err);
                    if (!data) return res.notFound();
                    if (!data.fileFd) {
                        return res.notFound();
                    }
                    var SkipperDisk = require('skipper-disk');
                    var fileAdapter = SkipperDisk();
                    var disposition = 'attachment';
                    if (inline) {
                        disposition = 'inline';
                    }
                    res.set('Content-Disposition',
                        disposition + '; filename*=UTF-8\'\'' + encodeURI(data.name));
                    fileAdapter
                        .read(data.fileFd)
                        .on('error', function (err) {
                            return res.notFound();
                        })
                        .pipe(res);
                });
        };

        var relationArchive = function (userType, callback) {
            if (userType.length > 0) {
                if (params.comment) {
                    CommentArchive
                        .findOne({
                            archive: params.id,
                            comment: params.comment
                        })
                        .exec(function (err, data) {
                            if (err) callback(err);
                            else if (!data) callback('error');
                            else callback(null, data);
                        });
                } else {
                    RequestArchive
                        .findOne({
                            archive: params.id,
                            request: params.request
                        })
                        .exec(function (err, data) {
                            if (err) callback(err);
                            else if (!data) callback('error');
                            else callback(null, data);
                        });
                }
            } else {
                callback('error');
            }
        };

        var getUserType = function (callback) {
            InternalService
                .getUserType(req.session.employee.id, params.request)
                .then(function (resp) {
                    callback(null, resp);
                })
                .catch(function (err) {
                    sails.log(err);
                    //res.notFound();
                    callback(err);
                });
        };

        if (params.id && params.request) {
            async.waterfall([
                getUserType,
                relationArchive,
            ], function (err, result) {
                if (err) {
                    return res.notFound();
                } else {
                    returnArchive(params.id, params.inline);
                }
            });
        } else {
            // TODO: Variar la validacion, esta demasiado especifica con request
            // y este archive se esta utilizando en otros modulos como publicaciones, permisos y viaticos
            returnArchive(params.id, params.inline);
            //return res.notFound();
        }
    },
    attachmentByOwner: function (req, res) {
        var params = req.allParams();
        Archive
            .findOne({
                id: params.id,
                owner: req.session.employee.id
            })
            .exec(function (err, data) {
                if (err) return res.negotiate(err);
                if (!data) return res.notFound();
                if (!data.fileFd) {
                    return res.notFound();
                }
                var SkipperDisk = require('skipper-disk');
                var fileAdapter = SkipperDisk();
                let disposition = params.inline ? 'inline' : 'attachment';
                res.set('Content-Disposition',
                    disposition + '; filename*=UTF-8\'\'' + encodeURI(data.name));
                fileAdapter
                    .read(data.fileFd)
                    .on('error', function (err) {
                        return res.notFound();
                    })
                    .pipe(res);
            });
    }
};

