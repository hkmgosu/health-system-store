/* global sails */

// WorkflowService.js - in api/services

'use strict';

module.exports = {
    /**
     * Recibe un objeto del modelo employee y retorna la unidad a la que reporta
     */
    getReportedUnit: employee => new Promise((resolve, reject) => {

        async.waterfall([
            cb => {
                if (employee.managedByUnit) { return cb(null, [{ id: employee.managedByUnit }]); }

                // Obtener unidad actual del solicitante
                Unit.findOne(employee.unit).then(unitFinded => {
                    let hierarchySplited = unitFinded.hierarchy.split('.');

                    // Obtener camino desde la unidad del solicitante hasta la raíz
                    Unit.find(hierarchySplited).sort('hierarchy DESC').then(unitList => {

                        // Se procesa la lista de unidades para excluir unidades Vip que
                        // estén a más de 1 nivel de distancia
                        _.remove(unitList, unit => {
                            let distance = hierarchySplited.length - unit.hierarchy.split('.').length;
                            return (unit.vipUnit && distance > 1);
                        });

                        return _.isEmpty(unitList) ? cb(new Error('No se encuentra unidad a reportar en la jerarquía')) : cb(null, unitList);

                    }, cb);
                }, cb);
            },
            (unitList, cb) => {
                async.detectSeries(unitList, (unit, cb) => {
                    EmployeeUnit.find({
                        unit: unit.id,
                        deleted: false,
                        role: ['surrogateBoss', 'boss']
                    }).populate('employee').then(employeeUnitList => {
                        // Si el solicitante es jefe de la unidad se debe continuar la búsqueda
                        let iImBoss = _.some(employeeUnitList, eUnit => (eUnit.employee.id === employee.id && eUnit.role === 'boss'));

                        if (!_.isEmpty(employeeUnitList) && !iImBoss) {
                            unit.members = employeeUnitList.map(employeeUnit => employeeUnit.employee);
                            cb(true);
                        } else { cb(false); }
                    }, () => cb(false));
                }, unitDetected => {
                    unitDetected ? cb(null, unitDetected) : cb(new Error('Error'));
                });
            }
        ], (err, unit) => {
            if (err) { return reject(err); }
            resolve(unit);
        });
    }),
    getEnabledStatusList: (id, module, idEmployee) => new Promise((resolve, reject) => {
        let model;
        if (module === 'viatic') model = Viatic;
        else if (module === 'permission') model = Permission;
        else { reject(); }
        let toStatus = [];

        model.findOne(id).then((moduleData) => {
            let isOwner = _.isEqual(moduleData.owner, idEmployee);
            WorkflowStatus.findOne({ id: moduleData.status })
                .populate('supervisors')
                .populate('to')
                .then(status => {
                    if (isOwner) {
                        toStatus = _.filter(status.to, { authorization: 'owner' }) || [];
                    }
                    _.remove(status.to, { authorization: 'owner' });

                    switch (status.authorization) {
                        case 'workflow':
                            if (_.some(status.supervisors, { id: idEmployee })) {
                                toStatus = toStatus.concat(status.to);
                            }
                            resolve(toStatus);
                            break;
                        case 'manager':
                            EmployeeUnit.find({
                                unit: moduleData.unit,
                                role: ['boss', 'surrogateBoss'],
                                deleted: false
                            }).then(employeeUnit => {
                                if (_.some(employeeUnit, { employee: idEmployee }) && !isOwner) {
                                    toStatus = toStatus.concat(status.to);
                                }
                                resolve(toStatus);
                            }, err => { });
                            break;
                        default:
                            resolve(toStatus);
                    }
                }, err => reject(err));
        }, err => reject(err));
    })
};