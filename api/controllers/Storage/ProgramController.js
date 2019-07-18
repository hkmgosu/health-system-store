/**
 * Storage/ProgramController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
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

        Program.find(filter).populate('program')
            .then(programs => res.send({
                ok: true,
                msg: 'Programas encontrados',
                obj: {
                    programs
                }
            })).catch(err => res.send({
                ok: false,
                msg: 'Error al consultar programas',
                obj: err
            }));
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
                Program.count(filter).exec(cb);
            },
            programs: cb => {
                Program.find(filter).paginate(paginate).exec(cb);
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
        let promise = Program.findOne({
            id: parseInt(req.body.id),
            deleted: false
        });
        promise.exec((err, program) => {
            if (err) {
                return res.send({
                    ok: false,
                    obj: err
                });
            }

            if (!program) {
                return res.send({
                    ok: false,
                    msg: 'PROGRAM.SEARCH.NOT_FOUND',
                    obj: err
                });
            }

            return res.send({
                ok: true,
                msg: 'PROGRAM.SEARCH.FOUND',
                obj: {
                    program: program
                }
            });
        });
    },


    /**
     * retorna ruta padre hijo del programa
     * @param {*} req 
     * @param {*} res 
     */
    _breadcrumbs: [],
    getBreadcrumbs(req, res) {
        this._breadcrumbs = [];
        this.getParent(parseInt(req.body.id), res);
    },

    getParent(id, res) {
        let ctl = this;
        Program.findOne({
                id: id,
                deleted: false
            })
            .exec((err, program) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });
                ctl._breadcrumbs.push(program);
                if (program.program) {
                    return ctl.getParent(program.program, res);
                } else {
                    return res.send({
                        ok: true,
                        obj: {
                            programs: this._breadcrumbs.reverse()
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
        Program.create(req.body.program).then(
            program => res.send({
                ok: true,
                msg: `Programa ${program.description} creado!`,
                obj: {
                    program: program
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
        Program.update({
                id: req.body.program.id,
                deleted: false
            }, req.body.program)
            .then(
                programs => res.send({
                    ok: true,
                    msg: `Programa: ${programs[0].description} modificado!`,
                    obj: {
                        program: programs[0]
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
        Program.findOne({
                id: req.body.id,
                deleted: false
            })
            .populate('subPrograms')
            .exec((err, program) => {
                if (err) return res.send({
                    ok: false,
                    obj: err
                });

                // verifica que no tenga subprogramas no eliminados
                for (let i = 0; i < program.subPrograms.length; ++i) {
                    if (!program.subPrograms[i].deleted) {
                        let newErr = new Error;
                        newErr.message = 'Programa tiene subprogramas asociados';
                        newErr.status = 500;
                        return res.send({
                            ok: false,
                            obj: newErr
                        });
                        break;
                    }
                }

                program.deleted = true;
                program.save(() => {
                    return res.send({
                        ok: true,
                        msg: `Programa: ${program.description} eliminado!`,
                        obj: {
                            program
                        }
                    });
                });
            });
    }
};