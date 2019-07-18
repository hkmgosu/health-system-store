/**
 * Storage/ActiveComponentController
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

		ActiveComponent.find(filter).exec((err,activeComponents) => {
			if (err) return res.send({ ok: false, obj: err });
			return res.send({ ok: true, obj: { activeComponents } });
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
				ActiveComponent.count(filter).exec(cb);
			},
			activeComponents: cb => {
				ActiveComponent.find(filter).paginate(paginate).exec(cb);
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
		let promise = ActiveComponent.findOne({ id: parseInt(req.body.id), deleted: false });
		promise.exec((err, activeComponent) => {
			if (err) {
				return res.send({
					ok: false,
					obj: err
				});
			}

			if (!activeComponent) {
				return res.send({
					ok: false,
					msg: 'ACTIVE_COMPONENT.SEARCH.NOT_FOUND',
					obj: err
				});
			}

			return res.send({
				ok: true,
				msg: 'ACTIVE_COMPONENT.SEARCH.FOUND',
				obj: {
					activeComponent: activeComponent
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
		ActiveComponent.create(req.body.activeComponent).then(
			activeComponent => res.send({
				ok: true,
				msg: `Componente activo [${activeComponent.description}] creado!`,
				obj: { activeComponent: activeComponent }
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
		ActiveComponent.update({ id: req.body.activeComponent.id, deleted: false }, req.body.activeComponent)
			.then(
				activeComponents => res.send({
					ok: true,
					msg: `Componente activo: [${activeComponents[0].description}] modificado!`,
					obj: { activeComponent: activeComponents[0] }
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
		ActiveComponent.update({ id: req.body.id, deleted: false }, { deleted: true })
			.then(
				activeComponents => res.send({
					ok: true,
					msg: `Componente activo: [${activeComponents[0].description}] eliminado!`,
					obj: { activeComponent: activeComponents[0] }
				}),
				err => res.send({ ok: false, obj: err })
			);
	}
};

