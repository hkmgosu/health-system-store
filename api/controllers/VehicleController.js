/**
 * VehicleController
 *
 * @description :: Server-side logic for managing Vehicles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    /**
     * Guarda o actualiza un Vehículo
     */
    save: function (req, res) {
        var vehicle = req.body.vehicle;
        _.isObject(vehicle.establishment) ? vehicle.establishment = vehicle.establishment.id : null;
        _.isObject(vehicle.status) ? vehicle.status = vehicle.status.id : null;
        if (vehicle.id) {
            delete vehicle.idGPS;
            Vehicle.update(vehicle.id, vehicle).exec(function (err, vehiclesUpdated) {
                if (err) { return res.send({ ok: false, obj: err }); }
                return res.send({ ok: true, msg: 'VEHICLE.SUCCESS.SAVE', obj: vehiclesUpdated.pop() });
            });
        } else {
            Vehicle.create(vehicle).exec(function (err, vehicleCreated) {
                if (err) {
                    return res.send({ ok: false, msg: 'VEHICLE.ERROR.CREATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'VEHICLE.SUCCESS.SAVE', obj: vehicleCreated });
                }
            });
        }
    },
    /**
     * Obtiene vehículos de acuerdo a criterios
     */
    get: function (req, res) {
        let sort = req.body.sort;
        /**
         * Filtro de búsqueda
         */
        var filter = {
            searchText: { 'contains': req.body.filter || '' },
            deleted: false
        };
        async.parallel({
            count: (cb) => {
                Vehicle
                    .count(filter)
                    .exec(cb);
            },
            vehicles: (cb) => {
                Vehicle
                    .find({
                        where: filter,
                        sort: _.extend(sort, {
                            id: 1
                        })
                    })
                    .populate('status')
                    .populate('establishment')
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || 10 })
                    .exec(cb);
            }
        }, function (err, results) {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: err });
            } else {
                return res.send({ ok: true, obj: results });
            }
        });
    },
    /**
     * Obtiene todos los vehículos
     */
    getAll: function (req, res) {
        Vehicle
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'VEHICLE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'VEHICLE.SEARCH.FOUND', obj: { vehicles: data } });
                }
            });
    },
    /**
     * Borra un vehículo
     */
    delete: function (req, res) {
        let idVehicle = req.body.idVehicle;
        if (!idVehicle) { return res.send({ ok: false }); }
        Vehicle.update({
            id: idVehicle
        }, {
                deleted: true
            }).exec(function (err, data) {
                if (err) {
                    sails.log(err);
                    return res.send({ msg: 'VEHICLE.ERROR.DELETE', ok: false, obj: { error: err } });
                } else {
                    sails.log(data);
                    return res.send({ msg: 'VEHICLE.SUCCESS.DELETE', ok: true });
                }
            });
    },
    getAutocomplete: (req, res) => {
        let searchText = req.body.searchText || '';
        let statusFilter = req.body.statusType ? { type: req.body.statusType } : null;
        VehicleStatus
            .find(statusFilter)
            .then(statusList => {
                Vehicle.find({
                    deleted: false,
                    searchText: { 'contains': searchText },
                    status: _.map(statusList, 'id')
                })
                    .sort('status')
                    .paginate({ page: 1, limit: 10 })
                    .populate('establishment')
                    .populate('status')
                    .then(
                        vehicleList => res.send({ ok: true, obj: vehicleList }),
                        err => res.send({ ok: false, obj: err })
                    );
            })
            .catch(err => res.send({ ok: false, obj: err }));
    },
    updateStatus: (req, res) => {
        let idVehicle = req.body.idVehicle,
            idStatus = req.body.idStatus;

        Vehicle.update(idVehicle, { status: idStatus }).exec(function (err, vehiclesUpdated) {
            if (err) { return res.send({ ok: false, obj: err }); }
            let vehicle = vehiclesUpdated.pop();
            if (vehicle.currentRemVehicle) {
                RemVehicle.update({ id: vehicle.currentRemVehicle }, {
                    status: 8
                }).then(remVehicleUpdatedList => {
                    let remVehicleUpdated = remVehicleUpdatedList.pop();
                    RemLogVehicle.create({
                        rem: remVehicleUpdated.rem,
                        remVehicle: remVehicleUpdated.id,
                        vehicle: remVehicleUpdated.vehicle,
                        createdBy: req.session.employee.id,
                        status: 8,
                        type: 'vehicleStatusChanged'
                    }).exec(() => { });
                    Vehicle.update(idVehicle, {
                        currentRemVehicle: null,
                        currentRem: null
                    }).then(() => { });
                });
            }
            return res.send({ ok: true, msg: 'VEHICLE.SUCCESS.SAVE' });
        });
    },
    getRemLog: (req, res) => {
        let idRemVehicle = req.body.idRemVehicle;
        RemLogVehicle
            .find({ remVehicle: idRemVehicle })
            .populate('status')
            .populate('createdBy')
            .then(remLogVehicle => res.send({ ok: true, obj: remLogVehicle }))
            .catch(() => { res.send({ ok: false }) });
    },
    watch: (req, res) => {
        if (req.isSocket) {
            Vehicle.find({ deleted: false }).then(vehicles => {
                Vehicle.subscribe(req, _.map(vehicles, 'id'));
                res.send({ ok: true });
            });
        } else {
            res.send({ ok: false });
        }
    },
    updatePosition: (req, res) => {
        if (_.isEmpty(req.body) || !_.isObject(req.body.data)) { return res.badRequest(); }
        let reqData = req.body.data;
        let patente = reqData.data.PATENTE;
        let coordinates = [
            parseFloat(reqData.ULTIMA_POSICION.LONGITUD),
            parseFloat(reqData.ULTIMA_POSICION.LATITUD)
        ];
        if (patente) {

            let position = {
                type: 'Point',
                coordinates: coordinates
            };

            Vehicle.findOne({ idGPS: patente }).then(vehicle => {

                if (!vehicle) { return; }

                // Actualizar campo position del vehículo
                Vehicle.query(
                    'update vehicle set "position" = \'' + JSON.stringify(position) + '\' where "id" = ' + vehicle.id,
                    (err, rawResult) => { if (err) { sails.log(err); } }
                );

                // Crear registro de log position
                VehiclePositionLog.create({
                    vehicle: vehicle.id,
                    remvehicle: vehicle.currentRemVehicle,
                    velocity: parseInt(reqData.ULTIMA_POSICION.VELOCIDAD),
                    emittedAt: new Date(reqData.ULTIMA_POSICION.FECHA),
                    position: position
                }).then(() => { }, err => sails.log(err));

                Vehicle.publishUpdate(vehicle.id, {
                    id: vehicle.id,
                    position: position
                });
            }, err => sails.log(err));
        }
        res.send({ ok: true, data: req.body.data });
    },
    /** Obtener la ruta de un vehículo durante un incidente */
    getRemVehicleRoute: (req, res) => {
        let idRemVehicle = req.body.idRemVehicle;
        if (!idRemVehicle) { return res.send({ ok: false }); }
        RemLogVehicle.find({
            remVehicle: idRemVehicle,
            type: 'vehicleStatusChanged'
        }).sort('id ASC').then(log => {
            let emittedAt;
            if (_.find(log, { finished: true })) {
                emittedAt = {
                    '>': log[0].createdAt,
                    '<': log[log.length - 1].createdAt
                };
            } else {
                emittedAt = {
                    '>': log[0].createdAt
                };
            }
            VehiclePositionLog.find({
                vehicle: log[log.length - 1].vehicle,
                emittedAt: emittedAt
            }).sort('emittedAt ASC').then(
                route => res.send({ ok: true, obj: route }),
                err => res.send({ ok: false, obj: err })
            );
        });
    },
    /**
     * Obtener historial REMS de un vehículo
     */
    getRemHistory: (req, res) => {
        let idVehicle = req.body.idVehicle;
        if (!idVehicle) { return res.send({ ok: false }); }

        RemVehicle
            .find({
                vehicle: idVehicle,
                deleted: false
            })
            .sort('createdAt DESC')
            .limit(10)
            .then(remVehicles => {
                let remIds = _.map(remVehicles, 'rem');
                Rem
                    .find(remIds)
                    .populate('createdBy')
                    .populate('callReason')
                    .populate('subCallReason')
                    .then(rems => {
                        remVehicles.forEach(remVehicle => {
                            remVehicle.rem = _.find(rems, { id: remVehicle.rem });
                        });
                        res.send({ ok: true, obj: remVehicles });
                    });
            });
    },
    setSearchText: (req, res) => {
        Vehicle.find({ deleted: false }).populate('establishment').then(vehicleList => {
            vehicleList.forEach(vehicle => {
                vehicle.searchText = vehicle.name + ' ' + (vehicle.establishment ? vehicle.establishment.name : '');
                vehicle.save(() => { });
            });
        });
        res.send('Procesando...');
    },
    getCurrentCareTeam: (req, res) => {
        let { idVehicle } = req.body;
        if (!idVehicle) { return res.badRequest(); }
        let now = new Date();
        Workshift.find({
            startTime: { '<': now },
            endTime: { '>': now },
            deleted: false
        }).then(workshiftList => {
            if (_.isEmpty(workshiftList)) { return res.notFound(); }
            CareTeam.findOne({
                workshift: _.map(workshiftList, 'id'),
                vehicle: idVehicle,
                deleted: false
            }).populate('workshift').then(careTeam => {
                if (_.isEmpty(careTeam)) { return res.notFound(); }
                careTeam = careTeam.toJSON();
                // Obtener lista de participantes
                ParticipantService.getList({ careTeam: careTeam.id }).then(participantList => {
                    careTeam.participantList = participantList;
                    res.ok(careTeam);
                }, err => res.serverError(err));
            }, err => res.serverError(err));
        }, err => res.serverError(err));
    }
};

