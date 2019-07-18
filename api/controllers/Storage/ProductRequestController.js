/**
 * Storage/ProductRequestController
 *
 * @description :: Server-side logic for managing Storage/presentationtypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * obtiene todos los datos
     * @param {*} req
     * @param {*} res
    getAll(req, res) {
        let employeeUnits = [];
        let objStatus = {};

        // buscar las unidades asignadas al usuario
        this.getEmployeeUnits(req.session.employee.id)
            .then(units => employeeUnits = units)
            .then(() => ProductRequestStatus.find())
            .then(statuses => {
                    objStatus = _.indexBy(statuses, "id");
                    let querys = {};
                    let criteria = {};
                    criteria.where = req.body.where || {};
                    criteria.where.deleted = false;
                    criteria.where.or = [{
                            createdBy: req.session.employee.id
                        },
                        {
                            destinyUnit: employeeUnits,
                            status: {
                                '>': 1
                            }
                        },
                        {
                            originUnit: [...employeeUnits, req.session.employee.unit],
                            status: {
                                '>': 1
                            }
                        },
                    ];
                    criteria.sort = 'date DESC';

                    if (req.body.filter) criteria.where.searchText = {
                        'contains': req.body.filter
                    };

                    if (req.body.page && req.body.limit) {
                        // por paginacion
                        querys.found = cb => ProductRequest.count()
                            .where(criteria.where)
                            .exec(cb);
                        querys.productRequests = cb => ProductRequest.find(criteria)
                            .populate('originUnit')
                            .populate('destinyUnit')
                            .populate('createdBy')
                            .paginate({
                                page: req.body.page,
                                limit: req.body.limit
                            }).exec(cb);
                    } else {
                        // si consulta sin paginacion
                        querys.productRequests = cb => ProductRequest.find(criteria)
                            .populate('originUnit')
                            .populate('destinyUnit')
                            .populate('createdBy')
                            .exec(cb);
                    }

                    // ejecutar las consultas en paralelo y retornarla
                    async.parallel(querys, (err, obj) => {
                        if (err) return res.send({
                            ok: false,
                            obj: err
                        });

                        for (let i = 0; i < obj.productRequests.length; ++i) {
                            obj.productRequests[i].status = objStatus[obj.productRequests[i].status];
                        }

                        return res.send({
                            ok: true,
                            obj
                        });
                    });
                },
                err => res.send({
                    ok: false,
                    obj: err
                })
            );
	},
	*/

	getAll(req, res) {
		// si consulta sin paginacion
		let criteria = {};
		criteria.where = req.body.where || {};
		criteria.where.deleted = false;
		criteria.sort = 'id';

		if (req.body.filter) criteria.where.glosa = {
			'contains': req.body.filter
		};

		ProductRequestStatus.find()
			.then(statuses => {
				let querys = {};

				if (req.body.page && req.body.limit) {
					// por paginacion
					querys.found = cb => ProductRequest.count()
						.where(criteria.where)
						.exec(cb);
					querys.productRequests = cb => ProductRequest.find(criteria)
						.populate('originUnit')
						.populate('destinyUnit')
						.populate('createdBy')
						.paginate({
							page: req.body.page,
							limit: req.body.limit
						}).exec(cb);
				} else {
					// si consulta sin paginacion
					querys.productRequests = cb => ProductRequest.find(criteria)
						.populate('originUnit')
						.populate('destinyUnit')
						.populate('createdBy')
						.exec(cb);
				}

				// ejecutar las consultas en paralelo y retornarla
				async.parallel(querys, (err, obj) => {
					if (err) return res.send({
						ok: false,
						obj: err
					});

					for (let i = 0; i < obj.productRequests.length; ++i) {
						let status = obj.productRequests[i].status;
						obj.productRequests[i].status = _.find(statuses, s => s.id == status) || status;
					}

					return res.send({
						ok: true,
						obj
					});
				});
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al obtener estados',
				obj: err
			}))
	},


	getByPk(id) {
		let productRequest = {};
		return ProductRequest.findOne({
			id: id,
			deleted: false
		}).populate('status')
			.populate('originUnit')
			.populate('destinyUnit')
			.populate('costCenter')
			.populate('createdBy')
			.then(record => productRequest = Object.assign({}, record))
			.then(() => ProductRequestDetail.find({
				deleted: false,
				productRequest: productRequest.id
			}).populate('product').populate('subprogram'))
			.then(details => productRequest.details = details, err => sails.log.error(err))
			.then(() => DosageType.find())
			.then(dosageTypes => {
				productRequest.details.forEach(detail => {
					detail.product.dosageType = dosageTypes.find(el => el.id == detail.product.dosageType) || null;
				});
				return productRequest;
			});
	},

    /**
     * obtiene un registro por id
     * @param {*} req
     * @param {*} res
     */
	get(req, res) {
		this.getByPk(req.body.id)
			.then(productRequest => res.send({
				ok: !!productRequest,
				msg: productRequest ? 'PRODUCT_REQUEST.SEARCH.FOUND' : 'PRODUCT_REQUEST.SEARCH.NOT_FOUND',
				obj: {
					productRequest
				}
			}))
			.catch(err => res.send({
				ok: false,
				msg: 'Error al consultar solicitud de producto',
				obj: err
			}));
	},



	getComments(req, res) {
		ProductRequest.subscribe(req, [req.body.id]);

		let productRequest = {};
		let idDetails = [];
		let comments = [];

		ProductRequest.findOne(req.body.id).populate('details')
			.then(record => productRequest = record)
			.then(() => idDetails = _.pluck(productRequest.details, 'id'))

			// comentarios de solicitud
			.then(() => StorageComment.find({
				table: 'productRequest',
				idRecord: productRequest.id
			}).populate('createdBy').populate('attachments'))
			.then(records => comments = comments.concat(records))

			// comentarios de detalles
			.then(() => StorageComment.find({
				table: 'productRequestDetail',
				idRecord: idDetails
			}).populate('createdBy').populate('attachments'))
			.then(records => comments = comments.concat(records))

			// ordenar por fecha
			.then(() => comments = comments.sort((a, b) => {
				if (a.createdAt == b.createdAt) return 0;
				return a.createdAt < b.createdAt ? 1 : -1; // descendente
			}))
			.then(() => res.send({
				ok: true,
				obj: {
					comments
				}
			})).catch(err => res.send({
				ok: false,
				msg: 'Error al buscar comentarios',
				obj: err
			}));
	},



	getDetailComments(req, res) {
		ProductRequestDetail.subscribe(req, [req.body.id]);

		StorageComment.find({
			where: {
				table: 'productRequestDetail',
				idRecord: req.body.id
			},
			sort: {
				createdAt: 'DESC'
			}
		}).populate('createdBy').populate('attachments')
			.then(comments => res.send({
				ok: true,
				obj: {
					comments
				}
			})).catch(err => res.send({
				ok: false,
				msg: 'Error al buscar comentarios',
				obj: err
			}));
	},



    /**
     * retorna un array con las unidades permitidas al usuario
     * @param {callback} next
    getEmployeeUnits(employeeId) {
        return new Promise((resolve, reject) => {
            StorageManager.find({
                deleted: false,
                employee: employeeId
            }).populate('unit').exec((err, storageManagers) => {
                if (err) return reject(err);
                let units = [];
                for (let i = 0; i < storageManagers.length; ++i) {
                    if (storageManagers[i].unit && !storageManagers[i].unit.deleted) {
                        units.push(storageManagers[i].unit.id);
                    }
                }
                resolve(units);
            });
        });
	},
	*/


    /**
     * crea un registro y retorna sus datos
     * @param {*} req
     * @param {*} res
     */
	create(req, res) {
		let dataEncab = Object.assign({}, req.body.productRequest);
		if (dataEncab.details) delete dataEncab.details;
		dataEncab.createdBy = req.session.employee.id;

		ProductRequest.create(dataEncab)
			.then(productRequest => ProductRequest.findOne(productRequest.id))
			.then(productRequest => {
				// registrar comentario de creacion
				StorageComment.create({
					table: 'productRequest',
					idRecord: productRequest.id,
					type: 'created',
					createdBy: req.session.employee.id
				}).exec(() => { });

				res.send({
					ok: true,
					msg: 'Se ha creado la solicitud de productos',
					obj: {
						productRequest
					}
				});
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al crear solicitud',
				obj: err
			}));
	},

    /**
     * actualiza un registro por id y retorna sus datos
     * @param {*} req
     * @param {*} res
     */
	update(req, res) {
		let controller = this;
		let dataEncab = Object.assign({}, req.body.productRequest);
		if (dataEncab.details) delete dataEncab.details;
		dataEncab.updatedBy = req.session.employee.id;

		ProductRequest.subscribe(req, [dataEncab.id]);

		// Buscar solicitud
		ProductRequest.findOne({
			deleted: false,
			id: dataEncab.id
		}).then(productRequest => ProductRequest.update(dataEncab.id, dataEncab))
			.then(productRequest => controller.getByPk(dataEncab.id))
			.then(productRequest => {
				// registrar comentario de modificacion
				controller.sendComment(
					productRequest.id, (dataEncab.status ? 'statusChanged' : 'generalChanged'),
					productRequest, req.session.employee
				);

				res.send({
					ok: true,
					msg: 'Se actualizo la solicitud de productos',
					obj: {
						productRequest
					}
				});
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al actualizar la solicitud de productos',
				obj: err
			}));
	},


    /**
     * crea comentario del registro
     * @param {*} req
     * @param {*} res
     */
	createComment(req, res) {
		if (!req.body.comment.idRecord) {
			return res.send({
				msg: 'REQUEST.ERROR.COMMENTID',
				ok: false
			});
		}
		req.body.comment.type = 'comment';
		req.body.comment.createdBy = req.session.employee.id;

		ProductRequest.subscribe(req, [req.body.comment.idRecord]);

		if (req.body.comment.attachments) {
			_.remove(req.body.comment.attachments, archive => {
				if (!archive.id) {
					return archive;
				}
			});
		}

		// crear el comentario
		StorageComment.create(req.body.comment).exec((err, comment) => {
			if (err) return res.send({
				ok: false,
				msg: 'COMMENT.ERROR.CREATE',
				obj: err
			});

			// agregar los archivos adjuntos
			req.body.comment.attachments.forEach(attach => {
				StorageCommentArchive.create({
					comment: comment.id,
					archive: attach.id
				}).exec(() => { });
			});

			comment.createdBy = req.session.employee;
			comment.attachments = req.body.comment.attachments;
			ProductRequest.message(comment.idRecord, {
				message: 'productRequest:' + comment.type,
				data: comment
			});

			return res.send({
				ok: true,
				msg: 'COMMENT.SUCCESS.CREATE',
				obj: comment
			});
		});
	},



    /**
     * crea comentario del detalle
     * @param {*} req
     * @param {*} res
     */
	createDetailComment(req, res) {
		if (!req.body.comment.idRecord) {
			return res.send({
				msg: 'REQUEST.ERROR.COMMENTID',
				ok: false
			});
		}
		req.body.comment.type = 'comment';
		req.body.comment.createdBy = req.session.employee.id;

		ProductRequestDetail.subscribe(req, [req.body.comment.idRecord]);

		if (req.body.comment.attachments) {
			_.remove(req.body.comment.attachments, archive => {
				if (!archive.id) {
					return archive;
				}
			});
		}

		// crear el comentario
		StorageComment.create(req.body.comment).exec((err, comment) => {
			if (err) return res.send({
				ok: false,
				msg: 'COMMENT.ERROR.CREATE',
				obj: err
			});

			// agregar los archivos adjuntos
			comment.attachments = [];
			if (req.body.comment.attachments) {
				req.body.comment.attachments.forEach(attach => {
					StorageCommentArchive.create({
						comment: comment.id,
						archive: attach.id
					}).exec(() => { });
				});
				comment.attachments = req.body.comment.attachments;
			}

			comment.createdBy = req.session.employee;
			ProductRequestDetail.message(comment.idRecord, {
				message: 'productRequestDetail:' + comment.type,
				data: comment
			});

			return res.send({
				ok: true,
				msg: 'COMMENT.SUCCESS.CREATE',
				obj: comment
			});
		});
	},



	sendComment(id, type, data, employee) {
		let dataComment = {
			table: 'productRequest',
			idRecord: id,
			createdBy: employee.id,
			type: type
		};
		StorageComment.create(dataComment).exec(() => { });

		dataComment.createdBy = employee;
		ProductRequest.message(id, {
			message: 'productRequest:comment',
			data: dataComment
		});

		ProductRequest.message(id, {
			message: 'productRequest:' + type,
			data: data
		});
	},


	sendDetailComment(id, type, data, employee, description) {
		if (!description) description = null;
		let dataComment = {
			table: 'productRequestDetail',
			idRecord: id,
			createdBy: employee.id,
			type: type,
			description: description
		};
		StorageComment.create(dataComment).exec(() => { });

		dataComment.createdBy = employee;
		ProductRequestDetail.message(id, {
			message: 'productRequestDetail:comment',
			data: dataComment
		});

		ProductRequestDetail.message(id, {
			message: 'productRequestDetail:' + type,
			data: data
		});
	},


    /**
     * elimina un registro por id, retorna los datos anteriores
     * @param {*} req
     * @param {*} res
     */
	delete(req, res) {
		const arrCommands = [];

		arrCommands.push(
			ProductRequest.update({
				id: req.body.id,
				deleted: false
			}, {
					id: req.body.id,
					deleted: true
				})
		);

		// crear el log
		let dataLog = {
			productRequest: req.body.id,
			createdBy: req.session.employee.id,
			type: 'deleted'
		};
		arrCommands.push(ProductRequestLog.create(dataLog));

		Promise.all(arrCommands).then((results, err) => {
			if (err) return res.send({
				ok: false,
				obj: err
			});

			return res.send({
				ok: true,
				msg: `Solicitud de producto eliminado!`,
				obj: {
					productRequest: results[0]
				}
			});
		});
	},


	unsubscribe(req, res) {
		ProductRequest.unsubscribe(req, req.body.id);
	},


	unsubscribeDetail(req, res) {
		ProductRequestDetail.unsubscribe(req, req.body.id);
	},


    /**
     * retorna el detalle de la solicitud y los envios asociados
     * @param {*} req
     * @param {*} res
     */
	getDetail(req, res) {
		ProductRequestDetail.findOne({
			id: req.body.id,
			deleted: false
		})
			.populate('productRequest')
			.populate('product')
			.populate('subprogram')
			.then(productRequestDetail => {
				if (!productRequestDetail) return res.send({
					ok: false,
					msg: 'Detalle de la solicitud no encontrado',
					obj: {}
				});
				res.send({
					ok: true,
					msg: 'Detalle encontrado',
					obj: {
						productRequestDetail
					}
				});
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al buscar el detalle de la solicitud',
				obj: err
			}));
	},


    /**
     * agrega un detalle a la solicitud
     * @param {*} req
     * @param {*} res
     */
	addDetail(req, res) {
		let controller = this;
		let detail = req.body.detail;
		if (detail.product.id) detail.product = detail.product.id;

		ProductRequest.subscribe(req, [detail.productRequest]);

		ProductRequestDetail.create(detail)
			.then(record => ProductRequestDetail.findOne(record.id)
				.populate('productRequest')
				.populate('product')
				.populate('subprogram')
			).then(productRequestDetail => {
				// registrar comentario de modificacion
				controller.sendComment(
					productRequestDetail.productRequest, 'detailCreated',
					productRequestDetail, req.session.employee
				);
				res.send({
					ok: true,
					msg: 'Se agrego el detalle',
					obj: {
						productRequestDetail
					}
				});
			}).catch(err => res.send({
				ok: false,
				msg: 'Error al crear detalle de solicitud',
				obj: err
			}));
	},


    /**
     * actualiza la informacion del detalle de solicitud
     * @param {*} req
     * @param {*} res
     */
	updateDetail(req, res) {
		let controller = this;
		ProductRequestDetail.subscribe(req, [req.body.detail.id]);

		ProductRequestDetail.update(req.body.detail.id, req.body.detail)
			.then(results => ProductRequestDetail.findOne(results[0].id)
				.populate('productRequest')
				.populate('product')
				.populate('subprogram')
			).then(productRequestDetail => {
				// registrar comentario de modificacion
				controller.sendDetailComment(
					productRequestDetail.id, 'detailUpdated',
					productRequestDetail, req.session.employee,
					productRequestDetail.product.description
				);

				res.send({
					ok: true,
					msg: 'Se actualizo el detalle de solicitud',
					obj: {
						productRequestDetail
					}
				});
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al actualizar detalle de solicitud',
				obj: err
			}));
	},


    /**
     * elimina un detalle de la solicitud
     * @param {*} req
     * @param {*} res
     */
	delDetail(req, res) {
		let controller = this;
		let detail = {};
		ProductRequestDetail.findOne(req.body.id).populate('product')
			.then(record => detail = record)
			.then(() => ProductRequestDetail.destroy(req.body.id))
			.then(affected => {
				ProductRequest.subscribe(req, [detail.productRequest]);

				// registrar comentario de modificacion
				controller.sendComment(
					detail.productRequest, 'detailDeleted',
					detail, req.session.employee,
					detail.product.description
				);

				res.send({
					ok: true,
					msg: 'Se elimino el detalle',
					obj: detail
				});
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al eliminar el detalle',
				obj: err
			}));
	},


    /**
     * consulta los envios realizados a un item de una solicitud
     * @param {*} req
     * @param {*} res
     */
	getShippings(req, res) {
		let shippings = [];
		let idProductStocks = [];
		Shipping.find({
			deleted: false,
			productRequestDetail: req.body.id
		}).populate('createdBy').populate('updatedBy')
			.then(records => shippings = records)
			.then(() => idProductStocks = _.pluck(shippings, 'originProductStock'))
			.then(() => ProductStock.find(idProductStocks).populate('productLot'))
			.then(productStocks => {
				for (let i = 0; i < shippings.length; ++i) {
					let productStock = _.find(productStocks,
						el => el.id == shippings[i].originProductStock
					);
					shippings[i].originProductStock = productStock || {};
				}
				res.send({
					ok: true,
					msg: 'Envios encontrados',
					obj: {
						shippings
					}
				});
			}).catch(err => res.send({
				ok: false,
				msg: 'Error al consultar envios',
				obj: err
			}));
	},



    /**
     * los itemes a mostrar en la impresion del reporte
     * @param {*} req
     * @param {*} res
     */
	getReportPrint(req, res) {
		ProductRequest.query("SELECT * FROM get_report_request($1)", [req.body.id],
			(err, results) => {
				if (err) return res.send({
					ok: false,
					msg: 'Error al consultar procedimiento',
					obj: err
				});
				res.send({
					ok: true,
					msg: 'Resultado encontrado',
					obj: {
						results
					}
				});
			})
	},


    /**
     * agrega un envio al detalle de la solicitud
     * @param {*} req
     * @param {*} res
     */
	addShipping(req, res) {
		let controller = this;
		let shipping = {};
		let originUnit = null;
		let originProductStock = null;
		let originLocation = null;
		let detail = {};
		let productRequest = {};
		req.body.shipping.createdBy = req.session.employee.id;

		// buscar registro stock
		ProductStock.findOne(req.body.shipping.originProductStock)
			.then(record => originProductStock = record)
			.then(() => ProductRequestDetail.findOne(req.body.shipping.productRequestDetail)
				.populate('product')
				.populate('productRequest'))
			.then(record => {
				detail = record;
				productRequest = detail.productRequest;
			})

			// consultar si la unidad que solicita es una bodega
			.then(() => Unit.findOne(detail.productRequest.originUnit))
			.then(unit => originUnit = unit)

			// consultar una ubicacion por defecto para la unidad que solicita
			.then(() => Location.findOne({
				deleted: false,
				unit: originUnit.id
			}))
			.then(location => originLocation = location)

			// si la unidad que solicita es bodega, se requiere el registro de stock
			.then(() => {
				sails.log.info('originUnit: ' + JSON.stringify(originUnit));
				if (originUnit.storage) {
					return ProductStock.findOne({
						productLot: originProductStock.productLot,
						product: originProductStock.product,
						unit: detail.productRequest.originUnit,
						deleted: false
					});
				} else {
					return null;
				}
			})
			// si el registro de stock no existe para esa bodega, se crea
			.then(productStock => {
				sails.log.info('productStock: ' + JSON.stringify(productStock));
				if (!productStock && originUnit.storage) {
					// si la unidad no tiene ubicacion, enviar mensaje de error
					if (!originLocation) {
						return Promise.reject('La bodega que solicita no tiene ubicaciones');
					}

					return ProductStock.create({
						productLot: originProductStock.productLot,
						product: originProductStock.product,
						unit: detail.productRequest.originUnit,
						location: originLocation,
						stock: 0
					});
				} else {
					return productStock;
				}
			})
			// se indica el registro de stock a utilizar en el destino del envio
			.then(productStock => {
				sails.log.info('productStock: ' + JSON.stringify(productStock));
				if (productStock) {
					req.body.shipping.destinyProductStock = productStock.id;
				}
			})

			// buscar un registro eliminado para reutilizar
			.then(() => Shipping.findOne({
				productRequestDetail: req.body.shipping.productRequestDetail,
				deleted: true
			}))
			.then(record => {
				// si existe se reutiliza
				if (record) {
					record.deleted = false;
					record.quantityReceived = 0;
					record.createdAt = new Date();
					req.body.shipping = Object.assign(record, req.body.shipping);
					sails.log.info('reutiliza shipping: ' + JSON.stringify(req.body.shipping));
					return Shipping.update(record.id, req.body.shipping);
				} else {
					// si no existe, se crea un nuevo registro
					sails.log.info('create shipping: ' + JSON.stringify(req.body.shipping));
					return Shipping.create(req.body.shipping);
				}
			})
			.then(result => Shipping.findOne(result.length ? result[0].id : result.id)
				.populate('productRequestDetail')
				.populate('createdBy'))
			.then(record => shipping = record)
			.then(() => ProductStock.findOne(shipping.originProductStock).populate('productLot'))
			.then(productStock => shipping.originProductStock = productStock)

			// cambio estado de productRequest a Despachado
			.then(() => ProductRequest.update(detail.productRequest.id, {
				id: detail.productRequest.id,
				status: 21
			}))

			// disminuye stock de bodega saliente
			.then(records => {
				if (records.length) productRequest.status = 21;

				sails.log.info(`Se disminuye stock id ${shipping.originProductStock.id} de bodega que envia`);
				return ProductStock.update(shipping.originProductStock.id, {
					stock: shipping.originProductStock.stock - shipping.quantitySend
				});
			})

			// fin: envio respuesta al navegador
			.then(() => {
				ProductRequestDetail.subscribe(req, [shipping.productRequestDetail.id]);

				// registrar comentario de modificacion
				controller.sendDetailComment(
					shipping.productRequestDetail.id, 'shippingCreated',
					shipping, req.session.employee,
					detail.product.description
				);

				res.send({
					ok: true,
					msg: 'Se agrego el envio al detalle',
					obj: {
						shipping
					}
				})
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al guardar envio de detalle',
				obj: err
			}));
	},


    /**
     * elimina un envio del detalle de la solicitud
     * @param {*} req
     * @param {*} res
     */
	delShipping(req, res) {
		let controller = this;
		let shipping = {};
		Shipping.findOne(req.body.id)
			.populate('productRequestDetail')
			.populate('originProductStock')
			.then(record => shipping = record)
			.then(() => Shipping.update(shipping.id, {
				id: shipping.id,
				deleted: true
			}))
			.then(affected => {
				sails.log.info(`rollback (incrementa) stock id ${shipping.originProductStock.id} de bodega que envia`);
				return ProductStock.update(shipping.originProductStock.id, {
					stock: shipping.originProductStock.stock + shipping.quantitySend
				});
			})
			.then(affected => ProductRequestDetail.findOne(shipping.productRequestDetail.id)
				.populate('product'))
			.then(detail => {
				ProductRequestDetail.subscribe(req, [shipping.productRequestDetail.id]);
				shipping.productRequestDetail.quantitySend -= shipping.quantitySend;

				// registrar comentario de modificacion
				controller.sendDetailComment(
					shipping.productRequestDetail.id, 'shippingDeleted',
					shipping, req.session.employee,
					detail.product.description
				);

				res.send({
					ok: true,
					msg: 'Se elimino el envio de detalle',
					obj: {
						shipping
					}
				});
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al eliminar el envio de detalle',
				obj: err
			}));
	},


    /**
     * actualiza la informacion del envio
     * se utiliza para confirma la cantidad recibida vs la cantidad enviada
     * @param {*} req
     * @param {*} res
     */
	updateShipping(req, res) {
		let controller = this;
		let shipping = {};
		let oldQuantityReceived = 0;
		let idProductRequest = 0;

		req.body.shipping.updatedBy = req.session.employee.id;

		Shipping.findOne(req.body.shipping.id)
			.then(record => oldQuantityReceived = record.quantityReceived || 0)
			.then(() => Shipping.update(req.body.shipping.id, req.body.shipping))
			.then(records => Shipping.findOne(records[0].id)
				.populate('productRequestDetail')
				.populate('destinyProductStock')
				.populate('createdBy')
				.populate('updatedBy'))
			.then(record => {
				shipping = record;
				idProductRequest = shipping.productRequestDetail.productRequest;
				return ProductStock.findOne(shipping.originProductStock).populate('productLot');
			})
			.then(productStock => shipping.originProductStock = productStock)

			// actualiza stock de unidad que recibe
			.then(() => {
				if (shipping.destinyProductStock) {
					sails.log.info(`Se incrementa stock id ${shipping.destinyProductStock.id} de bodega solicitante`);
					ProductStock.update(shipping.destinyProductStock.id, {
						stock: shipping.destinyProductStock.stock +
							(shipping.quantityReceived - oldQuantityReceived)
					})
						.then(affected => sails.log.info('stock actualizado'))
						.catch(sails.log.error);
				} else {
					return null;
				}
			})

			// actualiza estado de solicitud
			.then(() => ProductRequestDetail.find({
				deleted: false,
				productRequest: idProductRequest
			}))
			.then(details => {
				let totalRequest = 0;
				let totalReceived = 0;
				for (let i = 0; i < details.length; ++i) {
					totalRequest += details[i].quantityBoss2;
					totalReceived += details[i].quantityReceived;
				}

				if (totalReceived && totalReceived >= totalRequest) {
					// recepcion total
					sails.log.info('recepcion total id', idProductRequest);
					return ProductRequest.update(idProductRequest, {
						id: idProductRequest,
						status: 32
					});
				} else {
					return [];
				}
			})
			.then(records => {
				if (records.length) {
					ProductRequest.subscribe(req, [idProductRequest]);
					// registrar comentario de modificacion de estado
					controller.sendComment(
						idProductRequest, 'statusChanged',
						records[0], req.session.employee
					);
				}
			})

			// envia al navegador registro modificado
			.then(() => ProductRequestDetail.findOne(shipping.productRequestDetail.id)
				.populate('product'))
			.then(detail => {
				ProductRequestDetail.subscribe(req, [shipping.productRequestDetail.id]);

				// registrar comentario de modificacion
				controller.sendDetailComment(
					shipping.productRequestDetail.id, 'shippingUpdated',
					shipping, req.session.employee,
					detail.product.description
				);

				res.send({
					ok: true,
					msg: 'Se ha modificado el envio al detalle',
					obj: {
						shipping
					}
				});
			})
			.catch(err => res.send({
				ok: false,
				msg: 'Error al actualizar envio de detalle',
				obj: err
			}));
	},

    /**
     *
     *  Trae las unidades asignadas como bodega y la unidad a la cual pertenece el usuario
     *
     *
     *
     * **/

	getOriginUnits: (req, res) => {
		// id unidades asignadas y que no hallan sido eliminadas
		StorageManager.find({
			deleted: false,
			employee: req.session.employee.id
		}).then(configs => {
			let units = _.map(configs, 'unit');
			Unit.find({
				id: _.uniq([...units, (req.session.employee.unit || 0)]),
				deleted: false,
				level: {
					'!': -1
				}
			}).then(allUnits => {
				return res.send({
					ok: true,
					obj: {
						units: allUnits
					}
				});
			}, err => {
				sails.log.warn('getOriginUnits', err)
				return res.send({
					ok: true,
					obj: err
				});
			})

		},
			err => {
				sails.log.warn('getOriginUnits', err)
				return res.send({
					ok: true,
					obj: err
				});
			});
	}
};
