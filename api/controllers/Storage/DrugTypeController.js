/**
 * Storage/DrugTypeController
 *
 * @description :: Server-side logic for managing Storage/administrationways
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

		DrugType.find(filter).exec((err,drugTypes) => {
			if (err) return res.send({ ok: false, obj: err });
			return res.send({ ok: true, obj: { drugTypes } });
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
				DrugType.count(filter).exec(cb);
			},
			drugTypes: cb => {
				DrugType.find(filter).paginate(paginate).exec(cb);
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
		let promise = DrugType.findOne({ id: parseInt(req.body.id), deleted: false });
		promise.exec((err, drugType) => {
			if (err) {
				return res.send({
					ok: false,
					obj: err
				});
			}

			if (!drugType) {
				return res.send({
					ok: false,
					msg: 'DRUG_TYPE.SEARCH.NOT_FOUND',
					obj: err
				});
			}

			return res.send({
				ok: true,
				msg: 'DRUG_TYPE.SEARCH.FOUND',
				obj: {
					drugType: drugType
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
		DrugType.create(req.body.drugType).then(
			drugType => res.send({
				ok: true,
				msg: `Tipo de Droga ${drugType.description} creada`,
				obj: { drugType: drugType }
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
		DrugType.update({ id: req.body.drugType.id, deleted: false }, req.body.drugType)
			.then(
				drugTypes => res.send({
					ok: true,
					msg: `Tipo de Droga: ${drugTypes[0].description} modificada`,
					obj: { drugType: drugTypes[0] }
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
		DrugType.update({ id: req.body.id, deleted: false }, { deleted: true })
			.then(
				drugTypes => res.send({
					ok: true,
					msg: `Tipo de Droga: ${drugTypes[0].description} eliminada`,
					obj: { drugType: drugTypes[0] }
				}),
				err => res.send({ ok: false, obj: err })
			);
	}
};