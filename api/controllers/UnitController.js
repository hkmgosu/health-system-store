/**
 * UnitController
 *
 * @description :: Server-side logic for managing units
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getAll: function (req, res) {
        Unit
            .find({
                level: {
                    '!': -1
                },
                deleted: false
            })
            .populate('establishment')
            .exec(function (err, units) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'UNIT.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'UNIT.SEARCH.FOUND',
                        obj: units
                    });
                }
            });
    },
    save: function (req, res) {
        var unit = req.body.unit;
        if (unit.id) {
            Unit.update(unit.id, unit).exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'UNIT.ERROR.UPDATE',
                        obj: err
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'UNIT.SUCCESS.SAVE',
                        obj: data[0]
                    });
                }
            });
        } else {
            Unit.create(unit).exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'UNIT.ERROR.CREATE',
                        obj: err
                    });
                } else {
                    if (data.parent) {
                        // Buscar padre para obtener órden jerarquico
                        Unit
                            .findOne(data.parent)
                            .then(
                                parent => {
                                    Unit.update(data.id, {
                                        hierarchy: parent.hierarchy + '.' + data.id
                                    }).then(
                                        unit => {
                                            return res.send({
                                                ok: true,
                                                msg: 'UNIT.SUCCESS.SAVE',
                                                obj: unit[0]
                                            })
                                        },
                                        err => {
                                            return res.send({
                                                ok: false,
                                                err: err
                                            });
                                        }
                                    );
                                },
                                err => {
                                    return res.send({
                                        ok: false,
                                        err: err
                                    });
                                }
                            );
                    } else {
                        Unit.update(data.id, {
                            hierarchy: data.id,
                        }).then(
                            unit => {
                                return res.send({
                                    ok: true,
                                    msg: 'UNIT.SUCCESS.SAVE',
                                    obj: unit[0]
                                })
                            },
                            err => {
                                return res.send({
                                    ok: false,
                                    err: err
                                });
                            }
                        );
                    }
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
        Unit.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec(function (err, data) {
                if (err) {
                    sails.log(err);
                    return res.send({
                        msg: 'UNIT.ERROR.DELETE',
                        ok: false,
                        obj: {
                            error: err
                        }
                    });
                } else {
                    return res.send({
                        msg: 'UNIT.SUCCESS.DELETE',
                        ok: true
                    });
                }
            });
    },
    get: (req, res) => {
        var criteria = {
            deleted: false,
            level: {
                '!': -1
            },
            name: {
                'contains': req.body.filter || ''
            }
        };
        Unit.find(criteria)
            .populate('parent')
            .populate('establishment')
            .paginate({
                page: req.body.page || 1,
                limit: req.body.limit || 10
            })
            .then(
                unitList => res.send({
                    ok: true,
                    obj: {
                        list: unitList,
                        total: ''
                    }
                }),
                err => res.send({
                    ok: false
                })
            );
    },
    getAutocomplete: (req, res) => {
        let filter = req.body.filter || {};
        var criteria = {
            deleted: false,
            level: {
                '!': -1
            },
            name: {
                'contains': filter.searchText || ''
            }
        };
        if (req.body.establishment) {
            criteria.establishment = req.body.establishment;
        } else if (req.body.myEstablishment) {
            criteria.establishment = req.session.employee.establishment;
        }
        if (filter.adverseEvent) {
            criteria.adverseEvent = filter.adverseEvent;
        }
        Unit.find(criteria)
            .populate('parent')
            .populate('establishment')
            .paginate({
                page: req.body.page || 1,
                limit: req.body.limit || 10
            })
            .exec(function (err, units) {
                if (err) {
                    sails.log('error:', err);
                    return res.send({
                        ok: false,
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        obj: {
                            units: units
                        }
                    });
                }
            });
    },
    getAvailableToRequest: function (req, res) {
        Employee.findOne(req.session.employee.id)
            .populate('supervisedUnits')
            .then(employee => {
                var filter = {
                    deleted: false,
                    level: {
                        '!': -1
                    },
                    name: {
                        'contains': req.body.filter.name || ''
                    },
                    or: [{
                        id: _.map(employee.supervisedUnits, 'id'),
                        requestType: 'private'
                    }, {
                        requestType: 'public'
                    }]
                };
                Unit.find(filter)
                    .populate('parent')
                    .populate('establishment')
                    .paginate({
                        page: req.body.page || 1,
                        limit: req.body.limit || 10
                    })
                    .exec(function (err, units) {
                        if (err) {
                            sails.log('error:', err);
                            return res.send({
                                ok: false,
                                obj: {}
                            });
                        } else {
                            return res.send({
                                ok: true,
                                obj: {
                                    units: units
                                }
                            });
                        }
                    });
            });
    },
    /****
     * unidades del usuario segun config de bodega
     */
    getUnitsForStorageManagement: (req, res) => {
        // id unidades asignadas y que no hallan sido eliminadas
        StorageManager.find({
            deleted: false,
            employee: req.session.employee.id
        }).populate('unit', {
            deleted: false, // unidades vigentes (?) 
            level: {
                '!': -1
            }
        }).then(configs => {
            let units = _.map(configs, 'unit');
            return res.send({
                ok: true,
                obj: {
                    units
                }
            });
        },
            err => {
                sails.log.warn('getUnitsForStorageManagement', err)
                return res.send({
                    ok: true,
                    obj: err
                });
            });
    },
    exportOrgChart: function (req, res) {
        OrgChartService
            .create(req.body.orgChart)
            .then(function (resp) {
                sails.log(resp);
                return res.send({
                    ok: true,
                    msg: 'UNIT.SUCCESS.EXPORT',
                    obj: resp
                });
            })
            .catch(function (err) {
                sails.log(err);
                return res.send({
                    ok: false,
                    msg: 'UNIT.ERROR.EXPORT',
                    obj: err
                });
            });
    },
    resetHierarchy: function (req, res) {
        Unit
            .find({
                deleted: false,
                level: {
                    '!': -1
                }
            })
            .then(
                units => {

                    let updateUnits = () => {
                        let queries = [];
                        units.forEach((unit) => {
                            queries.push(Unit.update(unit.id, {
                                hierarchy: unit.hierarchy,
                                level: unit.level
                            }));
                        });
                        Promise.all(queries).then(values => {
                            res.send(values);
                        }, reason => {
                            res.send(reason);
                        });
                    };

                    let reAssignFields = (parentUnit) => {
                        let childs = _.filter(units, {
                            parent: parentUnit ? parentUnit.id : null
                        });
                        childs.forEach(childUnit => {
                            childUnit.level = parentUnit ? parentUnit.level + 1 : 0;
                            childUnit.hierarchy = parentUnit ? parentUnit.hierarchy + '.' + childUnit.id : childUnit.id;
                            reAssignFields(childUnit);
                        });
                    };
                    reAssignFields();
                    updateUnits();

                },
                err => {
                    return err;
                }
            )
    },
    getRequestUnits: (req, res) => {
        Unit.find({
            deleted: false,
            requestType: ['public', 'private']
        })
            .then(units => res.send({
                ok: true,
                obj: units
            }))
            .catch(err => res.send({
                ok: false,
                obj: err
            }));
    },
    getSupervisors: (req, res) => {
        let idUnit = req.body.idUnit;
        Unit.findOne(idUnit)
            .populate('supervisors')
            .then(unit => res.send({
                ok: true,
                obj: unit.supervisors
            }))
            .catch(err => res.send({
                ok: false,
                obj: err
            }));
    },
    addSupervisor: (req, res) => {
        let idEmployee = req.body.idEmployee;
        let idUnit = req.body.idUnit;
        Unit.findOne(idUnit).populate('supervisors').then(unit => {
            unit.supervisors.add(idEmployee);
            unit.supervisorsCount = unit.supervisors.length + 1;
            unit.save().then(() => res.send({
                ok: true
            }));
        });
    },
    rmSupervisor: (req, res) => {
        let idEmployee = req.body.idEmployee;
        let idUnit = req.body.idUnit;
        Unit.findOne(idUnit).populate('supervisors').then(unit => {
            unit.supervisors.remove(idEmployee);
            unit.supervisorsCount = unit.supervisors.length - 1;
            unit.save().then(() => res.send({
                ok: true
            }));
        });
    },
    /**
     * Método actualiza el valor del campo supervisorsCount
     */
    mapSupervisorsCount: (req, res) => {
        Unit.find({
            deleted: false
        }).populate('supervisors').then(unitList => {
            async.forEach(unitList, (unit, cb) => {
                unit.supervisorsCount = unit.supervisors.length;
                unit.save(cb);
            }, err => {
                if (err) {
                    res.send({
                        ok: false
                    });
                } else {
                    res.send({
                        ok: true
                    });
                }
            });
        });
    },
    mapEstablishment: (req, res) => {
        let idUnit = req.body.idUnit;
        Unit.findOne(idUnit).then(unit => {
            Unit.update({
                hierarchy: {
                    contains: idUnit
                }
            }, {
                    establishment: unit.establishment
                }).then(
                    () => res.send({
                        ok: true
                    }),
                    err => res.send({
                        ok: false
                    })
                );
        });
    },
    getUnitsEstablishment: (req, res) => {
        if (!req.body.establishment) {
            return res.send({
                ok: false,
                msg: 'UNIT.SEARCH.ERROR',
                obj: []
            });
        }
        Unit
            .find({
                establishment: req.body.establishment,
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
    getAdverseEventSupervisors: (req, res) => {
        if (!req.body.unit) {
            return res.send({
                ok: false,
                msg: 'UNIT.SEARCH.ERROR',
                obj: []
            });
        }

        Unit
            .findOne({
                id: req.body.unit,
                deleted: false
            })
            .populate('adverseEventSupervisors')
            .exec((err, data) => {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'UNIT.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'UNIT.SEARCH.FOUND',
                        obj: {
                            supervisors: data.adverseEventSupervisors
                        }
                    });
                }
            });
    },
    addAdverseEventSupervisors: (req, res) => {
        let idEmployee = req.body.employee;
        let idUnit = req.body.unit;
        if (!idUnit || !idEmployee) {
            return res.send({
                ok: false,
                msg: 'UNIT.SAVE.ERROR',
                obj: []
            });
        }
        Unit.findOne(idUnit).populate('adverseEventSupervisors').then(unit => {
            unit.adverseEventSupervisors.add(idEmployee);
            unit.adverseEventSupervisorsCount = unit.adverseEventSupervisors.length + 1;
            unit.save(
                err => {
                    if (err) {
                        sails.log(err);
                        return res.send({
                            ok: false,
                            msg: 'UNIT.SAVE.ERROR',
                            obj: []
                        });
                    } else {
                        return res.send({
                            ok: true,
                            msg: 'UNIT.SAVE.SUCCESS',
                            obj: []
                        })
                    }
                }
            );
        });
    },
    rmAdverseEventSupervisors: (req, res) => {
        let idEmployee = req.body.employee;
        let idUnit = req.body.unit;
        if (!idUnit || !idEmployee) {
            return res.send({
                ok: false,
                msg: 'UNIT.SAVE.ERROR',
                obj: []
            });
        }
        Unit.findOne(idUnit).populate('adverseEventSupervisors').then(unit => {
            unit.adverseEventSupervisors.remove(idEmployee);
            unit.adverseEventSupervisorsCount = unit.adverseEventSupervisors.length - 1;
            unit.save(
                err => {
                    if (err) {
                        sails.log(err);
                        return res.send({
                            ok: false,
                            msg: 'UNIT.SAVE.ERROR',
                            obj: []
                        });
                    } else {
                        return res.send({
                            ok: true,
                            msg: 'UNIT.SAVE.SUCCESS',
                            obj: []
                        })
                    }
                }
            );
        });
    },
    /**
     * Obtener listado de empleados encargados/jefes de la unidad
     */
    getMembersUnit: (req, res) => {
        if (!req.body.unit) {
            return res.send({ ok: false, msg: 'UNIT.SEARCH.ERROR', obj: [] });
        }
        EmployeeUnit.find({ unit: req.body.unit, deleted: false })
            .populate('employee')
            .exec((err, data) => {
                if (err) {
                    return res.negotiate({ msg: 'UNIT.SEARCH.ERROR', obj: err });
                } else {
                    return res.ok({ msg: 'UNIT.SEARCH.FOUND', members: data });
                }
            });
    },
    /**
     * Setear a empleado como encargado/jefe de unidad
     */
    setMember: (req, res) => {
        if (!req.body.unit || !req.body.employee || !req.body.role) {
            return res.send({ ok: false, msg: 'UNIT.SAVE.ERROR', obj: 'faltan datos' });
        }

        EmployeeUnit.findOne({
            employee: req.body.employee,
            unit: req.body.unit,
            deleted: false,
            role: req.body.role
        }).then(employeeUnit => {
            if (employeeUnit) {
                throw new Error('ya existe registro');
            } else {
                EmployeeUnit.create({
                    employee: req.body.employee,
                    unit: req.body.unit,
                    role: req.body.role,
                    startPeriod: new Date()
                }).then(
                    created => {
                        Unit.findOne(req.body.unit)
                            .then(unit => {
                                unit.membersCount++;
                                unit.save();
                            }, err => sails.log(err));
                        return res.ok(created);
                    },
                    err => { throw new Error(err); }
                );
            }
        }).catch(err => { return res.negotiate({ msg: 'Ha ocurrido un error', err: err }); });
    },
    /**
     * Quitar a empleado como encargado/jefe de unidad
     */
    removeMember: (req, res) => {
        if (!req.body.id) {
            return res.send({ ok: false, msg: 'UNIT.SAVE.ERROR', obj: [] });
        }
        EmployeeUnit.update(req.body.id, { deleted: true, endPeriod: new Date() })
            .then(result => {
                Unit.findOne(result[0].unit)
                    .then(unit => {
                        unit.membersCount--;
                        unit.save();
                    }, err => sails.log(err));
                return res.ok(result[0]);
            })
            .catch(err => { return res.negotiate({ msg: 'UNIT.SAVE.ERROR', err: err }); });
    }
};