/**
 * Storage/CategoryController
 *
 * @description :: Server-side logic for managing Storage/categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * obtiene todos los datos
     * @param {*} req 
     * @param {*} res 
     */
    getAll(req, res) {
        // si es con paginacion
        if (req.body.page && req.body.limit) {
            return this.getPaginate(req, res);
        }

        // si consulta sin paginacion
        let filter = {
            where: {},
            sort: 'description'
        };
        if (req.body.where) filter.where = req.body.where;
        if (req.body.filter) filter.where.description = {
            'contains': req.body.filter
        };
        filter.where.deleted = false;

        Category.find(filter).exec((err, categories) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: {
                    categories
                }
            });
        });
    },

    /**
     * obtiene los datos con paginacion
     * @param {*} req 
     * @param {*} res 
     */
    getPaginate(req, res) {
        let filter = {
            where: {},
            sort: 'description'
        };
        if (req.body.where) filter.where = req.body.where;
        if (req.body.filter) filter.where.description = {
            'contains': req.body.filter
        };
        filter.where.deleted = false;

        let paginate = {
            page: req.body.page || 1,
            limit: req.body.limit
        };

        async.parallel({
            found: cb => {
                Category.count(filter).exec(cb);
            },
            categories: cb => {
                Category.find(filter).paginate(paginate).exec(cb);
            }
        }, (err, results) => {
            if (err) return res.send({
                ok: false,
                obj: err
            });
            return res.send({
                ok: true,
                obj: results
            });
        });
    },

    /**
     * obtiene un registro por id
     * @param {*} req 
     * @param {*} res 
     */
    get(req, res) {
        let promise = Category.findOne({
            id: parseInt(req.body.id),
            deleted: false
        });
        promise.exec((err, category) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!category) {
                return res.send({
                    ok: false,
                    msg: 'CATEGORY.SEARCH.NOT_FOUND',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'CATEGORY.SEARCH.FOUND',
                obj: {
                    category: category
                }
            });
        });
    },


    /**
     * retorna ruta padre hijo del categoria
     * @param {*} req 
     * @param {*} res 
     */
    _breadcrumbs: [],
    getBreadcrumbs(req, res) {
        this._breadcrumbs = [];
        this.getParent(parseInt(req.body.id), res);
    },

    /**
     * funcion recursiva que llena el arreglo _breadcrumbs
     * @param {*} id identifica la categoria
     * @param {*} res response a utilizar para enviar arreglo al navegadar
     */
    getParent(id, res) {
        let ctl = this;
        Category.findOne({
                id: id,
                deleted: false
            })
            .exec((err, category) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });
                ctl._breadcrumbs.push(category);
                if (category.category) {
                    return ctl.getParent(category.category, res);
                } else {
                    return res.send({
                        ok: true,
                        obj: {
                            categories: this._breadcrumbs.reverse()
                        }
                    });
                }
            });
        return true;
    },


    /**
     * crea un registro y retorna sus datos
     * @param {*} req 
     * @param {*} res 
     */
    create(req, res) {
        Category.create(req.body.category).then(
            category => res.send({
                ok: true,
                msg: `Categoria ${category.description} creada!`,
                obj: {
                    category: category
                }
            }),
            err => res.send({
                ok: false,
                obj: err
            })
        );
    },

    /**
     * actualiza un registro por id y retorna sus datos
     * @param {*} req 
     * @param {*} res 
     */
    update(req, res) {
        Category.update({
                id: req.body.category.id,
                deleted: false
            }, req.body.category)
            .then(
                categories => res.send({
                    ok: true,
                    msg: `Categoria: ${categories[0].description} modificada!`,
                    obj: {
                        category: categories[0]
                    }
                }),
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
    },

    /**
     * elimina un registro por id, retorna los datos anteriores
     * @param {*} req 
     * @param {*} res 
     */
    delete(req, res) {
        Category.findOne({
                id: req.body.id,
                deleted: false
            })
            .populate('subCategories')
            .exec((err, category) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                // verifica que no tenga subcategorias no eliminadas
                for (let i = 0; i < category.subCategories.length; ++i) {
                    if (!category.subCategories[i].deleted) {
                        let newErr = new Error;
                        newErr.message = 'Categoria tiene subcategorias asociadas';
                        newErr.status = 500;
                        return res.send({
                            ok: false,
                            obj: newErr
                        });
                        break;
                    }
                }

                category.deleted = true;
                category.save(() => {
                    return res.send({
                        ok: true,
                        msg: `Categoria: ${category.description} eliminada!`,
                        obj: {
                            category
                        }
                    });
                });
            });
    }
};