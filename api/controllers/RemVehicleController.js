/**
 * RemVehicleController
 *
 * @description :: Server-side logic for managing RemVehicles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    updateStatus: (req, res) => {
        // Parámetros que recibe
        let idRemVehicle = req.body.idRemVehicle,
            idStatus = req.body.idStatus;
        // Validaciones
        if (!idStatus || !idRemVehicle) {
            return res.send({ ok: false });
        }
        // Actualización de estado
        RemVehicle
            .update(idRemVehicle, { status: idStatus })
            .then(remVehicleUpdatedList => {
                let remVehicleUpdated = remVehicleUpdatedList.pop();
                RemLogVehicle.create({
                    rem: remVehicleUpdated.rem,
                    vehicle: remVehicleUpdated.vehicle,
                    remVehicle: remVehicleUpdated.id,
                    status: remVehicleUpdated.status,
                    createdBy: req.session.employee.id,
                    type: 'vehicleStatusChanged'
                }).then(logCreated => {
                    if (remVehicleUpdated.vehicle) {
                        let vehicleToUpdate;
                        if (idStatus === 8) {
                            vehicleToUpdate = {
                                status: 2,
                                currentRem: null,
                                currentRemVehicle: null
                            };
                        } else {
                            vehicleToUpdate = {
                                status: idStatus
                            };
                        }
                        Vehicle.update(remVehicleUpdated.vehicle, vehicleToUpdate).then(vehicleList => {
                            if (!_.isEmpty(vehicleList)) {
                                let vehicle = vehicleList.pop();
                                logCreated.position = vehicle.position;
                                logCreated.save(() => { });
                                /*                                 if (!remVehicleUpdated.kmArrival && (idStatus === 8 || idStatus === 13)) {
                                                                    // Guardar km actual como campo km de llegada del despacho
                                                                    remVehicleUpdated.kmArrival = vehicle.km;
                                                                    remVehicleUpdated.save(() => {});
                                                                } */
                            }
                        });
                    }
                }).catch(err => sails.log(err));
                res.send({ ok: true });
            }).catch(() => {
                res.send({ ok: false });
            });
    },
    finishByRem: (req, res) => {
        let idRem = req.body.idRem;
        if (!idRem) { return res.send({ ok: false }) }
        RemVehicle.update({ deleted: false, rem: idRem, status: { '!': [8] } }, { status: 8 }).then(
            remVehicleUpdated => {
                /**
                 * Crear log por cada despacho actualizado
                 */
                remVehicleUpdated.forEach(remVehicle => {
                    RemLogVehicle.create({
                        rem: remVehicle.rem,
                        vehicle: remVehicle.vehicle,
                        remVehicle: remVehicle.id,
                        status: 8,
                        createdBy: req.session.employee.id,
                        type: 'vehicleStatusChanged'
                    }).then(() => { });
                });
                /**
                 * Actualizar estado vehículos de despachos modificados
                 */
                let vehicleList = _.remove(_.map(remVehicleUpdated, 'vehicle'), null);
                if (vehicleList.length > 0) {
                    Vehicle.update({ id: vehicleList }, {
                        status: 2,
                        currentRem: null,
                        currentRemVehicle: null
                    }).then(() => { });
                }
                res.send({ ok: true });
            },
            err => res.send({ ok: false })
        );
    }
};