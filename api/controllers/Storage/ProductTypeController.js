/**
 * ProductTypeController
 *
 * @description :: Server-side logic for managing producttypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    save: (req, res) => {
        if (req.body.productType.id) {
            ProductType
                .update(req.body.productType.id, req.body.productType)
                .exec(function(err, productTypes) {
                    if (err) {
                        return res.send({
                            ok: false,
                            msg: 'STORAGE.PRODUCT_TYPE.ERROR.SAVE',
                            obj: err
                        });
                    } else {
                        return res.send({
                            ok: true,
                            isNew: false,
                            msg: 'STORAGE.PRODUCT_TYPE.SUCCESS.SAVE',
                            obj: productTypes[0]
                        });
                    }
                });
        } else {
            ProductType
                .create(req.body.productType)
                .exec(function(err, productType) {
                    if (err) {
                        return res.send({
                            ok: false,
                            msg: 'STORAGE.PRODUCT_TYPE.ERROR.SAVE',
                            obj: err
                        });
                    } else {
                        return res.send({
                            ok: true,
                            isNew: true,
                            msg: 'STORAGE.PRODUCT_TYPE.SUCCESS.SAVE',
                            obj: productType
                        });
                    }
                });
        }
    },
    get: (req, res) => {
        let idProductType = req.body.idProductType;
        if (!idProductType) {
            return res.send({
                ok: false
            });
        }
        ProductType.findOne({
                id: idProductType,
                deleted: false
            })
            .then(
                productTypeFounded => res.send({
                    ok: !_.isEmpty(productTypeFounded),
                    obj: productTypeFounded
                }),
                () => res.send({
                    ok: false
                })
            );
    },
    getList: (req, res) => {

        let filter = {
            where: {
                deleted: false
            }
        };
        if (req.body.filter) {
            filter.where.or = [{
                description: {
                    'contains': req.body.filter
                }
            }];
        }

        let paginate = {};
        if(req.body.paginate) {
            paginate = {
                page: req.body.paginate.page || 1,
                limit: req.body.paginate.limit || 5
            }
        }
        

        async.parallel({
            total: cb => ProductType.count(filter).exec(cb),
            list: cb => {
                ProductType.find(filter)
                    .paginate(paginate)
                    .exec(cb)
            }
        }, (err, results) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }
            res.send({
                ok: !!results.list.length,
                obj: results
            });
        });
    },
    delete: function(req, res) {
        let idProductType = req.body.id;
        if (!idProductType) {
            return res.send({
                ok: false
            });
        }
        ProductType.update({
            id: idProductType
        }, {
            deleted: true
        }).then(
            productTypeDeleted => res.send({
                ok: !_.isEmpty(productTypeDeleted)
            }),
            () => res.send({
                ok: false
            })
        );
    },
};