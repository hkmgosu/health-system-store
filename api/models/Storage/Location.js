/**
 * Storage/Location.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	migrate: 'safe',
	connection: sails.config.models.connectionStorage,
	attributes: {
		description: {
			type: 'string',
			size: 50,
			required: true
		},
		unit: {
			model: 'Unit',
			required: true
		},
		deleted: {
			type: 'boolean',
			defaultsTo: false
		}
	},

	beforeUpdate(values, next) {
		if (values.id && values.deleted) {
			MovementDetail.count({
				deleted: false,
				location: values.id
			})
				.then(count => {
					if (count) {
						let newErr = new Error;
						newErr.status = 500;
						newErr.message = 'Ubicación tiene movimientos registrados';
						next(newErr);
					} else {
						ProductStock.count({
							deleted: false,
							location: values.id
						})
							.then(count => {
								if (count) {
									let newErr = new Error;
									newErr.status = 500;
									newErr.message = 'Ubicación tiene stocks registrados';
									next(newErr);
								} else {
									next();
								}
							});
					}
				})
		} else {
			next();
		}
	}
};
