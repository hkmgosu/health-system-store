/**
 * StorageManagerController
 *
 * @description :: Server-side logic for managing producttypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    save: (req, res) => {
        if (req.body.storageManager.id) {
            StorageManager
                .update(req.body.storageManager.id, req.body.storageManager)
                .exec(function(err, storageManagers) {
                    if (err) {
                        return res.send({
                            ok: false,
                            msg: 'STORAGE.STORAGE_MANAGER.ERROR.SAVE',
                            obj: err
                        });
                    } else {
                        return res.send({
                            ok: true,
                            msg: 'STORAGE.STORAGE_MANAGER.SUCCESS.SAVE',
                            obj: storageManagers[0]
                        });
                    }
                });
        } else {
            StorageManager
                .create(req.body.storageManager)
                .exec(function(err, storageManager) {
                    if (err) {
                        sails.log.warn('create SM error: ', err);
                        return res.send({
                            ok: false,
                            msg: 'STORAGE.STORAGE_MANAGER.ERROR.SAVE',
                            obj: err
                        });
                    } else {
                        return res.send({
                            ok: true,
                            isNew: true,
                            msg: 'STORAGE.STORAGE_MANAGER.SUCCESS.SAVE',
                            obj: storageManager
                        });
                    }
                });
        }
    },
    get: (req, res) => {
        let idStorageManager = req.body.idStorageManager;
        if (!idStorageManager) {
            return res.send({
                ok: false
            });
        }
        StorageManager.findOne({
                id: idStorageManager,
                deleted: false
            })
            .then(
                storageManagerFound => res.send({
                    ok: !_.isEmpty(storageManagerFound),
                    obj: storageManagerFound
                }),
                () => res.send({
                    ok: false
                })
            );
    },




    getAll(req, res) {
        let criteria = {};
        let where = req.body.where ? req.body.where : {};
        where.deleted = false;
        criteria.where = where;

        let querys = {};
        if (req.body.page && req.body.limit) {
            querys.found = cb => StorageManager.count(criteria.where).exec(cb);
            querys.storageManagers = cb => StorageManager.find(criteria)
                .populate('unit')
                .populate('employee')
                .paginate({
                    page: req.body.page,
                    limit: req.body.limit
                })
                .exec(cb);
        } else {
            querys.storageManagers = cb => StorageManager.find(criteria)
                .populate('unit')
                .populate('employee')
                .exec(cb);
        }

        // ejecutar las consultas en paralelo y retornarla
        async.parallel(querys, (err, obj) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });

            return res.send({
                ok: true,
                msg: 'Registros encontrados',
                obj
            });
        });
    },



    delete: (req, res) => {
        let idStorageManager = req.body.id;
        if (!idStorageManager) {
            return res.send({
                ok: false
            });
        }
        StorageManager.update({
            id: idStorageManager
        }, {
            deleted: true
        }).then(
            storageManagerDeleted => res.send({
                ok: !_.isEmpty(storageManagerDeleted)
            }),
            () => res.send({
                ok: false
            })
        );
    },
    saveStorageUnit: (req, res) => {
        if (!req.body.unit) return res.send({
            ok: false,
            msg: 'parametro unidad no ha sido enviada',
            obj: {}
        });
        Unit.findOne({
                id: req.body.unit,
                deleted: false
            })
            .then(() => {
                if (req.body.storage) {
                    return null;
                } else {
                    return StorageManager.destroy({
                        unit: req.body.unit
                    })
                }
            })
            .then(() => StorageManager.count({
                unit: req.body.unit,
                deleted: false
            }))
            .then(listCount => Unit.update({
                id: req.body.unit
            }, {
                storage: req.body.storage,
                isPharmaceutical: req.body.isPharmaceutical,
                storageManagerListCount: listCount
            }))
            .then(unitUpdated => {
                return res.send({
                    ok: true,
                    msg: 'UNIT.SAVE.SUCCESS',
                    obj: unitUpdated[0]
                });
            }, err => {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'UNIT.SAVE.ERROR',
                    obj: err
                });
            });
    },
    getStorageUnits: (req, res) => {
        Unit.find({
                storage: true,
                level: {
                    '!': -1
                },
                deleted: false
            })
            .populate('parent')
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'UNIT.SEARCH.ERROR',
                        obj: []
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'UNIT.SEARCH.FOUND',
                        obj: data
                    });
                }
            });
    },
    getStorageManagers: (req, res) => {
        if (!req.body.unit) {
            return res.send({
                ok: false,
                msg: 'UNIT.SEARCH.ERROR',
                obj: []
            });
        }

        StorageManager
            .find({
                unit: req.body.unit,
                deleted: false
            })
            .populate('employee')
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'UNIT.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    let filtred = [];
                    let toDelete = [];
                    // limpiar employee que no existe en populate
                    data.forEach(sm => {
                        if (sm['employee']) filtred.push(sm)
                        else toDelete.push(StorageManager.destroy(sm))

                    });
                    if (toDelete.length) {
                        Promise.all(toDelete).then(results => {
                            return res.send({
                                ok: true,
                                msg: 'UNIT.SEARCH.FOUND',
                                obj: {
                                    storageManagers: filtred
                                }
                            });
                        }, err => sails.log.warn(err));
                    } else {
                        return res.send({
                            ok: true,
                            msg: 'UNIT.SEARCH.FOUND',
                            obj: {
                                storageManagers: filtred
                            }
                        });
                    }
                }
            });
    },
    addStorageManager: (req, res) => {
        let idEmployee = req.body.employee;
        let idUnit = req.body.unit;
        if (!idUnit || !idEmployee) {
            return res.send({
                ok: false,
                msg: 'UNIT.SAVE.ERROR',
                obj: []
            });
        }
        Unit.findOne(idUnit).populate('storageManagerList').then(unit => StorageManager.create({
                employee: idEmployee,
                unit: idUnit
            })
            .then(() => StorageManager.count({
                unit: idUnit,
                deleted: false
            }))
            .then(listCount => Unit.update(idUnit, {
                storageManagerListCount: listCount
            }))
            .then(() => StorageManager.findOne({
                unit: idUnit,
                employee: idEmployee,
                deleted: false
            }).populate('employee'))
            .then(results => {
                return res.send({
                    ok: true,
                    msg: 'usuario agregado a la configuración de bodega',
                    obj: results
                });
            }), err => {
                sails.log.warn("no se pudo agregar usuario", err);
                return res.send({
                    ok: false,
                    msg: "no se pudo agregar usuario",
                    obj: err
                })
            });
    },
    rmStorageManager: (req, res) => {
        let idEmployee = req.body.employee;
        let idUnit = req.body.unit;
        if (!idUnit || !idEmployee) {
            return res.send({
                ok: false,
                msg: 'UNIT.SAVE.ERROR',
                obj: []
            });
        }
        Unit.findOne(idUnit).populate('storageManagerList').then(unit => StorageManager.destroy({
                employee: idEmployee,
                unit: idUnit
            })
            .then(() => StorageManager.count({
                unit: idUnit,
                deleted: false
            }))
            .then(listCount => Unit.update(idUnit, {
                storageManagerListCount: listCount
            }))
            .then(results => {
                return res.send({
                    ok: true,
                    msg: 'usuario removido',
                    obj: []
                });
            }), err => {
                sails.log.warn("no se pudo remover usuario", err);
                return res.send({
                    ok: false,
                    msg: "no se pudo remover usuario",
                    obj: err
                })
            });
    },
    updateStorageManager: (req, res) => {
        if (!req.body.employee && !req.body.unit) return res.send({
            ok: false,
            msg: 'error: indicar parametros de empleado y unidad'
        })
        StorageManager.update({
            employee: req.body.employee,
            unit: req.body.unit,
            deleted: false
        }, {
            isAdmin: req.body.isAdmin,
            isPharmacyBoss: req.body.isPharmacyBoss
        }).then(updated => res.send({
                ok: true,
                msg: "configuración de usuario en unidad de bodega actualizada",
                obj: {
                    storageManager: updated[0]
                }
            }),
            err => res.send({
                ok: false,
                msg: "no se pudo actualizar la configuración del usuario",
                obj: err
            })

        );
    }
};