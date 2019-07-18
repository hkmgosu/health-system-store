/**
 * Storage/ProductLot.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	migrate: 'safe',
	connection: sails.config.models.connectionStorage,
	attributes: {
		lot: {
			type: 'string',
			required: true,
			size: 20
		},
		product: {
			model: 'Product',
			required: true
		},
		expiration: {
			type: 'date'
		},
		deleted: {
			type: 'boolean',
			defaultsTo: false
		},
		productStocks: {
			collection: 'ProductStock',
			via: 'productLot'
		},
		productPack: {
			model: 'ProductPack'
		}
	},

	beforeValidate(values, cb) {
		let criteria = {};
		criteria.lot = values.lot;
		criteria.product = values.product;
		if (values.id) criteria.id = { '!': values.id };
		ProductLot.findOne(criteria)
			.then(productLot => {
				if (productLot) {
					cb(new Error(`Ya existe lote ${values.lot} para el producto ${values.product}`));
				} else {
					cb();
				}
			})
			.catch(err => cb(err));
	}
}
