/**
 * Storage/StorageReport
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getProductMostRequested(req, res) {
        let productType = (req.body.productType) ? req.body.productType : null;
        let product = (req.body.product) ? req.body.product : null;
        let units = (req.body.units) ? req.body.units : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        //Este metodo se realiza por filtro en formulario
        //por tanto el rango de fecha es obligatorio
        let minDate = (req.body.minDate) ? req.body.minDate : null;
        let maxDate = (req.body.maxDate) ? req.body.maxDate : null;

        if (!minDate) {
            return res.send({
                ok: false
            });
        }

        if (!maxDate) {
            return res.send({
                ok: false
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_products_most_requested($1, $2, $3, $4, $5, $6, $7)", [
                        units, productType, product, minDate, maxDate, null, null
                    ], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_products_most_requested($1, $2, $3, $4, $5, $6, $7)", [
                        units, productType, product, minDate, maxDate, paginate.page, paginate.limit
                    ], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getStockExpiration(req, res) {
        let productType = (req.body.productType) ? req.body.productType : null;
        let product = (req.body.product) ? req.body.product : null;
        let units = (req.body.units) ? req.body.units : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        //Este metodo se realiza por filtro en formulario
        //por tanto el rango de fecha es obligatorio
        let minDate = (req.body.minDate) ? req.body.minDate : null;
        let maxDate = (req.body.maxDate) ? req.body.maxDate : null;

        if (!minDate) {
            return res.send({
                ok: false
            });
        }

        if (!maxDate) {
            return res.send({
                ok: false
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_stock_expiration($1, $2, $3, $4, $5, $6, $7)", [units, productType, product, minDate, maxDate, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_stock_expiration($1, $2, $3, $4, $5, $6, $7)", [units, productType, product, minDate, maxDate, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getStockLot(req, res) {
        let productType = (req.body.productType) ? req.body.productType : null;
        let product = (req.body.product) ? req.body.product : null;
        let units = (req.body.units) ? req.body.units : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_stock_lot($1, $2, $3, $4, $5, $6)", [true, units, productType, product, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_stock_lot($1, $2, $3, $4, $5, $6)", [true, units, productType, product, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getCriticalStock(req, res) {
        let productType = (req.body.productType) ? req.body.productType : null;
        let units = (req.body.units) ? req.body.units : null;
        let product = (req.body.product) ? req.body.product : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_critical_stock($1, $2, $3, $4, $5)", [units, productType, product, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_critical_stock($1, $2, $3, $4, $5)", [units, productType, product, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getInputOutputProduct(req, res) {
        let product = (req.body.product) ? req.body.product : null;
        let units = (req.body.units) ? req.body.units : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        //Este metodo se realiza por filtro en formulario
        //por tanto el rango de fecha es obligatorio
        let minDate = (req.body.minDate) ? req.body.minDate : null;
        let maxDate = (req.body.maxDate) ? req.body.maxDate : null;

        if (!minDate) {
            return res.send({
                ok: false
            });
        }

        if (!maxDate) {
            return res.send({
                ok: false
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_movement_products($1, $2, $3, $4, $5, $6)", [units, product, minDate, maxDate, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_movement_products($1, $2, $3, $4, $5, $6)", [units, product, minDate, maxDate, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getMaxStock(req, res) {
        let productType = (req.body.productType) ? req.body.productType : null;
        let units = (req.body.units) ? req.body.units : null;
        let product = (req.body.product) ? req.body.product : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_max_stock($1, $2, $3, $4, $5)", [units, productType, product, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_max_stock($1, $2, $3, $4, $5)", [units, productType, product, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getWeightedPrice(req, res) {
        let productType = (req.body.productType) ? req.body.productType : null;
        let product = (req.body.product) ? req.body.product : null;

        let units = (req.body.units) ? req.body.units : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        let detailLot = (req.body.detailLot) ? true : false;
        let sp = (detailLot) ? "get_report_weighted_price_lot" : "get_report_weighted_price";

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };

        async.parallel({
                found: cb => {
                    Product.query("select count(*) from " + sp + "($1, $2, $3, $4, $5)", [units, productType, product, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from " + sp + "($1, $2, $3, $4, $5)", [units, productType, product, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });
                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getProducts(req, res) {
        let productType = (req.body.productType) ? req.body.productType : null;
        let product = (req.body.product) ? req.body.product : null;
        let units = (req.body.units) ? req.body.units : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        //Este metodo se realiza por filtro en formulario
        //por tanto el rango de fecha es obligatorio
        let minDate = (req.body.minDate) ? req.body.minDate : null;
        let maxDate = (req.body.maxDate) ? req.body.maxDate : null;

        if (!minDate) {
            return res.send({
                ok: false
            });
        }

        if (!maxDate) {
            return res.send({
                ok: false
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };

        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_products($1, $2, $3, $4, $5, $6, $7)", [units, productType, product, minDate, maxDate, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_products($1, $2, $3, $4, $5, $6, $7)", [units, productType, product, minDate, maxDate, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });
                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getPurchasesFromSuppliers(req, res) {
        let productType = (req.body.productType) ? req.body.productType : null;
        let company = (req.body.company) ? req.body.company : null;
        let units = (req.body.units) ? req.body.units : null;
        let product = (req.body.product) ? req.body.product : null;
        let document = (req.body.document) ? req.body.document : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        //Este metodo se realiza por filtro en formulario
        //por tanto el rango de fecha es obligatorio
        let minDate = (req.body.minDate) ? req.body.minDate : null;
        let maxDate = (req.body.maxDate) ? req.body.maxDate : null;

        if (!minDate) {
            return res.send({
                ok: false
            });
        }

        if (!maxDate) {
            return res.send({
                ok: false
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };

        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_purchases_from_suppliers($1, $2, $3, $4, $5, $6, $7, $8, $9)", [units, company, productType, product, document, minDate, maxDate, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_purchases_from_suppliers($1, $2, $3, $4, $5, $6, $7, $8, $9)", [units, company, productType, product, document, minDate, maxDate, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });
                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getBincard(req, res) {
        let product = (req.body.product) ? req.body.product : null;
        let units = (req.body.units) ? req.body.units : null;

        if (!product) {
            return res.send({
                ok: false,
                msg: 'enviar producto'
            });
        }

        if (!units) {
            return res.send({
                ok: false,
                msg: 'enviar unidad'
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        //Este metodo se realiza por filtro en formulario
        //por tanto el rango de fecha es obligatorio
        let minDate = (req.body.minDate) ? req.body.minDate : null;
        let maxDate = (req.body.maxDate) ? req.body.maxDate : null;

        if (!minDate) {
            return res.send({
                ok: false,
                msg: 'fecha Minima invalida'
            });
        }

        if (!maxDate) {
            return res.send({
                ok: false,
                msg: 'fecha Maxima invalida'
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_bincard($1, $2, $3, $4, $5, $6)", [units, product, minDate, maxDate, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_bincard($1, $2, $3, $4, $5, $6)", [units, product, minDate, maxDate, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: (results.found.rows[0].count > 1) ? results.found.rows[0].count : 0,
                        rows: (results.results.rows.length > 1) ? results.results.rows : []
                    }
                });
            });
    },
    getExpensePerUnit(req, res) {
        let unit = (req.body.unit) ? req.body.unit : null;
        let product = (req.body.product) ? req.body.product : null;

        if (!unit) {
            return res.send({
                ok: true
            });
        }

        //Este metodo se realiza por filtro en formulario
        //por tanto el rango de fecha es obligatorio
        let minDate = (req.body.minDate) ? req.body.minDate : null;
        let maxDate = (req.body.maxDate) ? req.body.maxDate : null;

        if (!minDate) {
            return res.send({
                ok: false
            });
        }

        if (!maxDate) {
            return res.send({
                ok: false
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_expense_per_unit($1, $2, $3, $4, $5, $6)", [unit, product, minDate, maxDate, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_expense_per_unit($1, $2, $3, $4, $5, $6)", [unit, product, minDate, maxDate, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getCenabast(req, res) {
        let year = (req.body.year) ? req.body.year : null;
        let month = (req.body.month) ? req.body.month : null;
        let product = (req.body.product) ? req.body.product : null;
        let units = (req.body.units) ? req.body.units : null;

        if (!units) {
            return res.send({
                ok: false
            });
        }

        if (units.length == 0) {
            return res.send({
                ok: true,
                obj: {
                    found: 0,
                    rows: []
                }
            });
        }

        if (!year) {
            return res.send({
                ok: false
            });
        }

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };


        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_cenabast($1, $2, $3, $4, $5, $6)", [units, year, month, product, null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_cenabast($1, $2, $3, $4, $5, $6)", [units, year, month, product, paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    },
    getConsolidatedProducts(req, res) {

        let paginate = {
            page: req.body.page || null,
            limit: req.body.limit || null
        };

        async.parallel({
                found: cb => {
                    Product.query("select count(*) from get_report_consolidated_products($1, $2)", [null, null], cb);
                },
                results: cb => {
                    Product.query("select * from get_report_consolidated_products($1, $2)", [paginate.page, paginate.limit], cb);
                }
            },
            (err, results) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });
                return res.send({
                    ok: true,
                    obj: {
                        found: results.found.rows[0].count,
                        rows: results.results.rows
                    }
                });
            });
    }
};