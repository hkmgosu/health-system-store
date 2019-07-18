/**
 * CommuneController
 *
 * @description :: Server-side logic for managing communes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';
module.exports = {
    getRoomList: (req, res) => {
        let idUnit = req.body.idUnit;
        Room.find({ unit: idUnit }).then(roomList => {
            roomList = roomList.map(room => room.toJSON());
            async.forEach(roomList, (room, cb) => {
                Bed.find({ room: room.id }).populate('currentPatient').then(bedList => {
                    room.bedList = bedList;
                    cb();
                }, cb);
            }, err => {
                res.send({ ok: true, obj: roomList });
            });
        }, err => res.send({ ok: false, obj: err }));
    },
    getUnitList: (req, res) => {
        let idEstablishment = req.body.idEstablishment;
        Unit.find({ establishment: idEstablishment }).then(
            unitList => res.send({ ok: true, obj: unitList }),
            err => res.send({ ok: false, obj: err })
        );
    },
    addRoom: (req, res) => {
        let room = req.body.room;
        Room.create(room).then(roomCreated => res.send({ ok: true, roomCreated }));
    },
    addBed: (req, res) => {
        let bed = req.body.bed;
        Bed.create(bed).then(bedCreated => res.send({ ok: true, bedCreated }));
    },
    addBedPatient: (req, res) => {
        let bedPatient = req.body.bedPatient;
        async.parallel({
            updateBed: cb => Bed.update(bedPatient.idBed, { currentPatient: bedPatient.idPatient }).exec(cb),
            createBedPatient: cb => BedPatient.create({
                patient: bedPatient.idPatient,
                bed: bedPatient.idBed
            }).exec(cb)
        }, (err) => {
            if (err) { res.send({ ok: false }); }
            else { res.send({ ok: true }); }
        });
    }
};