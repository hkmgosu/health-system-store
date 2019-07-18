/**
 * PermissionClosureController
 *
 * @description :: Server-side logic for managing permissions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    createClosure: (req, res) => {

        // Validaciones iniciales
        var closure = req.body.closure || {};
        var permissions = _.clone(closure.permissions);
        //if (!closure.correlativeStart || !Number.isInteger(closure.correlativeStart)) return res.negotiate({ ok: false, msg: 'Falta inicio correlativo' });
        if (permissions.length <= 0) return res.negotiate({ ok: false, msg: 'Falta set de permisos' });

        // Se completan datos
        closure.permissions = _.map(permissions, 'id');
        //closure.correlativeEnd = closure.correlativeStart + permissions.length - 1;
        closure.createdBy = req.session.employee.id;

        // Definición de variables
        var idApprovedStatus, idClosedStatus;
        var async = require('async');

        // Función que encontrara ids de los pasos(estados) de acuerdo al orden definido
        var findIds = (cb) => {
            WorkflowStatus
                .find({
                    order: [3, 5],
                    module: 'permission'
                })
                .then(result => {
                    idApprovedStatus = (_.find(result, { order: 3 })).id;
                    idClosedStatus = (_.find(result, { order: 5 })).id;
                    cb(null, { idApprovedStatus, idClosedStatus });
                })
                .catch(err => cb(err));
        };

        // Se verifica que se pueda actualizar
        var canUpdate = (ids, cb) => {
            // Primero valido que el estado de los permisos del set sea el estado esperado
            var canNot = _.some(permissions, permission => {
                return !((permission.status || {}).id === ids.idApprovedStatus);
            });
            if (canNot) {
                return async.setImmediate(() => cb('Existe un estado no valido en el set para realizar el cierre'));
            }
            // Valido que el usuario tenga privilegios sobre el estado y q el siguiente estado sea el esperado
            WorkflowStatus
                .findOne(ids.idApprovedStatus)
                .populate('to')
                .populate('supervisors')
                .then(status => {
                    let isValid = _.some((status || {}).to, { id: ids.idClosedStatus })
                        && _.some((status || {}).supervisors, { id: req.session.employee.id });
                    cb(null, isValid);
                })
                .catch(err => cb(err));
        };

        async.waterfall([
            findIds,// Busco los ids de estados
            canUpdate,// Valido el estado
        ], (err, result) => {
            if (err) return res.negotiate({ ok: false, msg: err });
            else {
                if (!result) return res.negotiate({ ok: false, msg: 'No se puede realizar la acción' });
                // Llegado a este punto, ya puedo guardar
                PermissionClosure
                    .create(closure)
                    .then(closureCreated => {
                        res.ok(closureCreated);
                    })
                    .catch(err => res.negotiate({ ok: false, msg: 'Intente más tarde', obj: err }));
            }
        });
    },
    getClosures: (req, res) => {
        var page = req.body.page || 1;

        async.parallel({
            count: (cb) => {
                PermissionClosure
                    .count({ deleted: false, })
                    .exec(cb);
            },
            data: (cb) => {
                PermissionClosure
                    .find({ deleted: false, })
                    .paginate({ page: page, limit: 15 })
                    .populate('createdBy')
                    .sort('createdAt DESC')
                    .then(data => cb(null, data))
                    .catch(err => cb(err, null));
            }
        }, (err, results) => {
            if (err) return res.negotiate(err);
            return res.ok({ closures: results.data, count: results.count });
        });
    },
    getClosureDetails: (req, res) => {
        if (!req.body.id) return res.negotiate('No ha ingresdo id de cierre');

        // Función que encontrara ids de los pasos(estados) de acuerdo al orden definido
        var findId = (cb) => {
            WorkflowStatus
                .findOne({ order: 3, module: 'permission' })
                .then(result => result.id ? cb(null, result.id) : cb('No existe estado'))
                .catch(err => cb(err));
        };

        // Se verifica que usuario pueda visualizar
        var canView = (idStatus, cb) => {
            // Valido que el usuario tenga privilegios sobre el estado
            WorkflowStatus
                .findOne(idStatus)
                .populate('supervisors')
                .then(status => {
                    cb(null, _.some((status || {}).supervisors, { id: req.session.employee.id }))
                })
                .catch(err => cb(err));
        };

        var async = require('async');

        async.waterfall([
            findId,// Busco el id del estado
            canView,// Valido el estado
        ], (err, result) => {
            if (err) return res.negotiate(err);
            else {
                if (!result) return res.negotiate('No tienes permisos');
                PermissionClosure
                    .findOne({ id: req.body.id, deleted: false })
                    .populate('createdBy')
                    .populate('permissions')
                    .then(result => {
                        async.eachOfLimit(result.permissions, 5, (permission, key, callback) => {
                            Permission
                                .findOne(permission.id)
                                .populate('owner')
                                .populate('status')
                                .populate('type')
                                .populate('unit')
                                .then(permissionData => {
                                    result.permissions[key] = permissionData;
                                    callback();
                                })
                                .catch(err => callback(err));
                        }, err => {
                            if (err) res.negotiate({ ok: false, msg: 'Intente más tarde', obj: err });
                            else res.ok(result);
                        });
                    })
                    .catch(err => res.negotiate(err));
            }
        });
    },
    confirm: (req, res) => {
        let { closure } = req.body;

        if (!(closure || {}).id) return res.negotiate('No existe id de cierre');
        if (((closure || {}).permissions || []).length === 0) return res.negotiate('Listado vacio');

        async.parallel({
            permissionClosure: cb => PermissionClosure.update(closure.id,
                {
                    confirmed: true,
                    correlativeStart: closure.permissions[0].correlativeNumber,
                    correlativeEnd: closure.permissions[closure.permissions.length - 1].correlativeNumber
                }).exec(cb),
            permissionList: cb => {
                async.forEach(closure.permissions, (permission, cb) => {
                    // Seleccionar nuevo estado
                    permission.status = 5;
                    // Crear log de cambio estado
                    PermissionLog.create({
                        createdBy: req.session.employee.id,
                        permission: permission.id,
                        type: 'statusChanged',
                        status: permission.status
                    }).then(() => { });
                    // Actualizar datos del permiso
                    Permission.update({ id: permission.id }, permission).exec(cb);
                }, cb);
            }
        }, (err, results) => {
            if (err) { return res.serverError(err); }
            res.ok();
        });
    }
}