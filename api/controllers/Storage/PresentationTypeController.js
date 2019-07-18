/**
 * Storage/PresentationTypeController
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
		let filter = { where:{ deleted: false }, sort:'description'};
		if (req.body.filter) filter.where.description = { 'contains': req.body.filter };

		PresentationType.find(filter).exec((err,presentationsType) => {
			if (err) return res.send({ ok: false, obj: err });
			return res.send({ ok: true, obj: { presentationsType } });
		});
	},

	/**
	 * obtiene los datos con paginacion
	 * @param {*} req 
	 * @param {*} res 
	 */
	getPaginate(req, res) {
		let filter = { where: { deleted: false }, sort: 'description'};
		if (req.body.filter) {
			filter.where.description = { 'contains': req.body.filter };
		}

		let paginate = {
			page: req.body.page || 1,
			limit: req.body.limit
		};

		async.parallel({
			found: cb => {
				PresentationType.count(filter).exec(cb);
			},
			presentationsType: cb => {
				PresentationType.find(filter).paginate(paginate).exec(cb);
			}
		}, (err, results) => {
			if (err) return res.send({ ok: false, obj: err });
			return res.send({ ok: true, obj: results });
		});
	},

	/**
	 * obtiene un registro por id
	 * @param {*} req 
	 * @param {*} res 
	 */
	get(req, res) {
		let promise = PresentationType.findOne({ id: parseInt(req.body.id), deleted: false });
		promise.exec((err, presentationType) => {
			if (err) {
				return res.send({
					ok: false,
					obj: err
				});
			}

			if (!presentationType) {
				return res.send({
					ok: false,
					msg: 'PRESENTATION_TYPE.SEARCH.NOT_FOUND',
					obj: err
				});
			}

			return res.send({
				ok: true,
				msg: 'PRESENTATION_TYPE.SEARCH.FOUND',
				obj: {
					presentationType: presentationType
				}
			});
		});
	},

	/**
	 * crea un registro y retorna sus datos
	 * @param {*} req 
	 * @param {*} res 
	 */
	create(req, res) {
		PresentationType.create(req.body.presentationType).then(
			presentationType => res.send({
				ok: true,
				msg: `Tipo de presentación ${presentationType.description} creada!`,
				obj: { presentationType: presentationType }
			}),
			err => res.send({ ok: false, obj: err })
		);
	},

	/**
	 * actualiza un registro por id y retorna sus datos
	 * @param {*} req 
	 * @param {*} res 
	 */
	update(req, res) {
		PresentationType.update({ id: req.body.presentationType.id, deleted: false }, req.body.presentationType)
			.then(
				presentationsType => res.send({
					ok: true,
					msg: `Tipo de presentación: ${presentationsType[0].description} modificada!`,
					obj: { presentationType: presentationsType[0] }
				}),
				err => res.send({ ok: false, obj: err })
			);
	},

	/**
	 * elimina un registro por id, retorna los datos anteriores
	 * @param {*} req 
	 * @param {*} res 
	 */
	delete(req, res) {
		PresentationType.update({ id: req.body.id, deleted: false }, { deleted: true })
			.then(
				presentationsType => res.send({
					ok: true,
					msg: `Tipo de presentación: ${presentationsType[0].description} eliminada!`,
					obj: { presentationType: presentationsType[0] }
				}),
				err => res.send({ ok: false, obj: err })
			);
	}
};

