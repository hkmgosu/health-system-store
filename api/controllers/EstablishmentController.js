/**
 * EstablishmentController
 *
 * @description :: Server-side logic for managing establishments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getAll: function (req, res) {
        Establishment
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'ESTABLISHMENT.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'ESTABLISHMENT.SEARCH.FOUND',
                        obj: {
                            establishments: data
                        }
                    });
                }
            });
    },
    getAllPublic: function (req, res) {
        Establishment
            .find({ deleted: false })
            .populate('address')
            .exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'ESTABLISHMENT.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'ESTABLISHMENT.SEARCH.FOUND',
                        obj: {
                            establishments: data
                        }
                    });
                }
            });
    },
    save: function (req, res) {
        var establishment = req.body.establishment;
        if (establishment.id) {
            Establishment
                .update(establishment.id, establishment)
                .exec(function (err, data) {
                    if (err) {
                        return res.send({
                            ok: false,
                            msg: 'ESTABLISHMENT.ERROR.UPDATE',
                            obj: err
                        });
                    } else {
                        return res.send({
                            ok: true,
                            msg: 'ESTABLISHMENT.SUCCESS.SAVE',
                            obj: {
                                establishment: data
                            }
                        });
                    }
                });
        } else {
            Establishment.create(establishment).exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'ESTABLISHMENT.ERROR.CREATE',
                        obj: err
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'ESTABLISHMENT.SUCCESS.SAVE',
                        obj: {
                            establishment: data
                        }
                    });
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
        Establishment.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec(function (err, data) {
                if (err) {
                    return res.send({
                        msg: 'ESTABLISHMENT.ERROR.DELETE',
                        ok: false,
                        obj: {
                            error: err
                        }
                    });
                } else {
                    return res.send({
                        msg: 'ESTABLISHMENT.SUCCESS.DELETE',
                        ok: true
                    });
                }
            });
    },
    get: function (req, res) {
        let filter = _.extend(req.body.filter || {}, { deleted: false }),
            paginate = _.extend({ page: 1, limit: 10 }, req.body.paginate || {}),
            options = req.body.options || { getTotal: false };
        async.parallel({
            total: cb => options.getTotal ? Establishment.count(filter).exec(cb) : async.setImmediate(cb),
            list: cb => Establishment.find(filter).populate('address').sort('name ASC').paginate(paginate).exec(cb)
        }, (err, results) => {
            if (err) { return res.send({ ok: false }); }
            res.send({ ok: true, obj: options.getTotal ? results : results.list });
        });
    },
    setBedManagementModuleAvailable: (req, res) => {
        let bedManagementModuleAvailable = req.body.bedManagementModuleAvailable;
        let idEstablishment = req.body.idEstablishment;
        Establishment.update(idEstablishment, {
            bedManagementModuleAvailable: bedManagementModuleAvailable
        }).then(
            establishmentUpdated => res.send({ ok: true, obj: establishmentUpdated }),
            err => res.send({ ok: false, obj: err })
        );
    },
    addBedManagementSupervisor: (req, res) => {
        let idEmployee = req.body.idEmployee;
        let idEstablishment = req.body.idEstablishment;
        Establishment.findOne(idEstablishment).populate('bedManagementSupervisors')
            .then(establishment => {
                establishment.bedManagementSupervisors.add(idEmployee);
                establishment.bedManagementSupervisorsCount = establishment.bedManagementSupervisors.length + 1;
                establishment.save((err) => {
                    err ? res.send({ ok: false, obj: err }) : res.send({ ok: true });
                });
            });
    },
    removeBedManagementSupervisor: (req, res) => {
        let idEmployee = req.body.idEmployee;
        let idEstablishment = req.body.idEstablishment;
        Establishment.findOne(idEstablishment).populate('bedManagementSupervisors')
            .then(establishment => {
                establishment.bedManagementSupervisors.remove(idEmployee);
                establishment.bedManagementSupervisorsCount = establishment.bedManagementSupervisors.length - 1;
                establishment.save((err) => {
                    err ? res.send({ ok: false, obj: err }) : res.send({ ok: true });
                });
            });
    },
    getBedManagementSupervisors: (req, res) => {
        let idEstablishment = req.body.idEstablishment;
        Establishment.findOne(idEstablishment)
            .populate('bedManagementSupervisors')
            .then(establishment => res.send({ ok: true, obj: establishment.bedManagementSupervisors }))
            .catch(err => res.send({ ok: false, obj: err }));
    },
    mapAddress: (req, res) => {
        Establishment.find().then(establishmentList => {
            async.forEachLimit(establishmentList, 50, (establishmentItem, cb) => {
                if (_.isEmpty(establishmentItem.addressText) &&
                    _.isEmpty(establishmentItem.position)
                ) { return async.setImmediate(cb); }

                establishmentItem.address = {
                    text: establishmentItem.addressText,
                    position: establishmentItem.position
                };
                establishmentItem.save(cb);
            }, err => {
                if (err) { return console.log(err); }
                console.log('Address Mapping Ok');
            });
        }, err => console.log(err));
        res.send('Trabajando para usted...');
    },
    getAdverseEventModuleAvailable: function (req, res) {
        Establishment
            .find({
                deleted: false,
                adverseEventModuleAvailable: true
            })
            .exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'ESTABLISHMENT.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'ESTABLISHMENT.SEARCH.FOUND',
                        obj: data
                    });
                }
            });
    },
    getAdverseEventSupervisors: (req, res) => {
        if (!req.body.establishment) {
            return res.send({ ok: false, msg: 'ESTABLISHMENT.SEARCH.ERROR', obj: [] });
        }

        Establishment
            .findOne({
                id: req.body.establishment,
                adverseEventModuleAvailable: true,
                deleted: false
            })
            .populate('adverseEventSupervisors')
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'ESTABLISHMENT.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'ESTABLISHMENT.SEARCH.FOUND',
                        obj: { supervisors: data.adverseEventSupervisors }
                    });
                }
            });
    },
    addAdverseEventSupervisors: (req, res) => {
        let idEmployee = req.body.employee;
        let idEstablishment = req.body.establishment;
        if (!idEstablishment || !idEmployee) {
            return res.send({ ok: false, msg: 'ESTABLISHMENT.SAVE.ERROR', obj: [] });
        }
        Establishment.findOne(idEstablishment).populate('adverseEventSupervisors').then(establishment => {
            establishment.adverseEventSupervisors.add(idEmployee);
            establishment.adverseEventSupervisorsCount = establishment.adverseEventSupervisors.length + 1;
            establishment.save(
                err => {
                    if (err) {
                        sails.log(err);
                        res.send({ ok: false, msg: 'ESTABLISHMENT.SAVE.ERROR', obj: [] });
                    } else {
                        res.send({ ok: true, msg: 'ESTABLISHMENT.SAVE.SUCCESS', obj: [] });
                    }
                }
            );
        });
    },
    rmAdverseEventSupervisors: (req, res) => {
        let idEmployee = req.body.employee;
        let idEstablishment = req.body.establishment;
        if (!idEstablishment || !idEmployee) {
            return res.send({ ok: false, msg: 'ESTABLISHMENT.SAVE.ERROR', obj: [] });
        }
        Establishment.findOne(idEstablishment).populate('adverseEventSupervisors').then(establishment => {
            establishment.adverseEventSupervisors.remove(idEmployee);
            establishment.adverseEventSupervisorsCount = establishment.adverseEventSupervisors.length - 1;
            establishment.save(
                err => {
                    if (err) {
                        sails.log(err);
                        res.send({ ok: false, msg: 'ESTABLISHMENT.SAVE.ERROR', obj: [] })
                    } else {
                        res.send({ ok: true, msg: 'ESTABLISHMENT.SAVE.SUCCESS', obj: [] })
                    }
                }
            );
        });
    }
};

