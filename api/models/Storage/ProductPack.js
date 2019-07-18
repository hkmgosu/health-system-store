/**
 * Storage/ProductPack.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	migrate: 'safe',
	connection: sails.config.models.connectionStorage,
	attributes: {
		product: {
			model: 'Product',
			required: true
		},
		company: {
			model: 'company',
			required: true
		},
		fantasyName: {
			type: 'string',
			required: true
		},
		packtype: {
			model: 'PackType',
			required: true
		},
		typeunitmeasure: {
			model: 'TypeUnitMeasure'
		},
		indicatorcontainer: {
			type: 'string',
			enum: ['primario', 'secundario', 'terciario'],
			required: true
		},
		quantity: {
			type: 'integer',
			required: true
		},
		code: {
			type: 'string',
			required: true,
			size: 20
		},
		deleted: {
			type: 'boolean',
			defaultsTo: false
		}
	},

	beforeCreate(values, next) {
		ProductPack.findOne({
			code: values.code,
			product: values.product,
			deleted: false
		}).exec((err, data) => {
			if (err) return next(err);
			if (!data) return next();

			let newErr = new Error;
			newErr.message = 'Código del Pack YA EXISTE';
			newErr.status = 500;
			return next(newErr);
		});
	}
};
