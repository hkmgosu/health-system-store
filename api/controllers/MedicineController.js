/**
 * MedicineController
 *
 * @description :: Server-side logic for managing medicines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    /**
     * Obtiene todos las medicamentos
     */
    getAll: function (req, res) {
        Medicine
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({ ok: false, msg: 'MEDICINE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'MEDICINE.SEARCH.FOUND', obj: { medicines: data } });
                }
            });
    },
    /**
     * Obtiene medicamentos de acuerdo a filtro de búsqueda
     */
    get: (req, res) => {
        var filter = {
            deleted: false,
            visibleSamu: true,
            name: { 'contains': req.body.filter || '' }
        };

        async.parallel({
            count: (cb) => {
                Medicine
                    .count(filter)
                    .exec(cb);
            },
            data: (cb) => {
                Medicine
                    .find(filter)
                    .populate('vias')
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || 10 })
                    .exec((err, medicines) => {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, medicines);
                        }
                    });
            }
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: err });
            } else {
                return res.send({ ok: true, obj: { medicines: results.data, found: results.count } });
            }
        });
    },
    getByIds: (req, res) => {
        if (req.body.ids) {
            var filter = {
                deleted: false,
                id: req.body.ids
            };

            Medicine
                .find(filter)
                .exec((err, medicines) => {
                    if (err) {
                        return res.send({ ok: false, msg: 'Error' });
                    } else {
                        return res.send({ ok: true, msg: 'ok', obj: medicines });
                    }
                });
        } else {
            return res.send({ ok: false, msg: 'Error' });
        }
    },
    /**
     * Obtiene todas las vias medicinales
     */
    getAllMedicineVia: (req, res) => {
        MedicineVia
            .find({ deleted: false })
            .populate('medicine')
            .exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'MEDICINEVIA.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'MEDICINEVIA.SEARCH.FOUND', obj: { medicineVias: data } });
                }
            });
    },
    /**
     * Crea o actualiza una medicina
     */
    save: (req, res) => {
        if (!req.body.medicine) {
            return res.send({ ok: false, msg: 'MEDICINE.ERROR.SAVE' });
        }
        var medicine = req.body.medicine;
        medicine.categoryMedicine = medicine.categoryMedicine && isNaN(medicine.categoryMedicine) ? null : medicine.categoryMedicine;
        medicine.subCategoryMedicine = medicine.subCategoryMedicine && isNaN(medicine.subCategoryMedicine) ? null : medicine.subCategoryMedicine;
        medicine.drugCategory = medicine.drugCategory && isNaN(medicine.drugCategory) ? null : medicine.drugCategory;
        if (medicine.id) {
            Medicine.update(medicine.id, medicine).exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'MEDICINE.ERROR.UPDATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'MEDICINE.SUCCESS.SAVE', obj: data[0] });
                }
            });
        } else {
            Medicine.create(medicine).exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'MEDICINE.ERROR.CREATE', obj: err });
                } else {
                    return res.send({ ok: true, msg: 'MEDICINE.SUCCESS.SAVE', obj: data });
                }
            });
        }
    },
    /**
     * Borra una medicina
     */
    delete: (req, res) => {
        if (!req.body.id) {
            return res.send({ msg: 'MEDICINE.ERROR.DELETE', ok: false });
        }

        Medicine.update({
            id: req.body.id
        }, {
                deleted: true
            }).exec((err, data) => {
                if (err) {
                    sails.log(err);
                    return res.send({ msg: 'MEDICINE.ERROR.DELETE', ok: false, obj: { error: err } });
                } else {
                    return res.send({ msg: 'MEDICINE.SUCCESS.DELETE', ok: true });
                }
            });
    },
    getAllCategoryMedicines: (req, res) => {
        CategoryMedicine
            .find({ deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'MEDICINE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'MEDICINE.SEARCH.FOUND', obj: { categoryMedicines: data } });
                }
            });
    },
    getAllSubCategoryMedicines: (req, res) => {
        SubCategoryMedicine
            .find({ deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'MEDICINE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'MEDICINE.SEARCH.FOUND', obj: { subCategoryMedicines: data } });
                }
            });
    },
    getAllDrugCategories: (req, res) => {
        DrugCategory
            .find({ deleted: false })
            .exec((err, data) => {
                if (err) {
                    return res.send({ ok: false, msg: 'MEDICINE.SEARCH.ERROR', obj: {} });
                } else {
                    return res.send({ ok: true, msg: 'MEDICINE.SEARCH.FOUND', obj: { drugCategories: data } });
                }
            });
    },
    /**
     * Obtiene medicamentos del servicio de acuerdo a filtro de búsqueda
     */
    getMedicineService: (req, res) => {
        var filter = {
            deleted: false,
            name: { 'contains': req.body.filter || '' }
        };

        async.parallel({
            count: (cb) => {
                MedicineService
                    .count(filter)
                    .exec(cb);
            },
            data: (cb) => {
                MedicineService
                    .find(filter)
                    .paginate({ page: req.body.page || 1, limit: req.body.limit || 10 })
                    .exec((err, medicines) => {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, medicines);
                        }
                    });
            }
        }, (err, results) => {
            if (err) {
                sails.log(err);
                return res.send({ ok: false, obj: err });
            } else {
                return res.send({ ok: true, obj: { medicines: results.data, found: results.count } });
            }
        });
    },
    getMedicineServiceByIds: (req, res) => {
        if (req.body.ids) {
            var filter = {
                deleted: false,
                id: req.body.ids
            };

            MedicineService
                .find(filter)
                .exec((err, medicines) => {
                    if (err) {
                        return res.send({ ok: false, msg: 'Error' });
                    } else {
                        return res.send({ ok: true, msg: 'ok', obj: medicines });
                    }
                });
        } else {
            return res.send({ ok: false, msg: 'Error' });
        }
    },
};

