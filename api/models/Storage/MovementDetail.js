/**
 * Storage/Movement.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	migrate: 'safe',
	connection: sails.config.models.connectionStorage,
	attributes: {
		movement: {
			model: 'Movement',
			required: true
		},
		product: {
			model: 'Product'
		},
		productCode: 'string',
		productDescription: 'string',
		subprogram: {
			model: 'Program'
		},
		location: {
			model: 'Location'
		},
		productPack: {
			model: 'ProductPack'
		},
		quantity: {
			type: 'integer',
			required: true
		},
		priceItem: {
			type: 'integer',
			defaultsTo: 0
		},
		lot: 'string',
		expiration: 'date',
		deleted: {
			type: 'boolean',
			defaultsTo: false
		},
		searchText: {
			type: 'string',
			size: 300
		}
	},

	beforeDestroy(criteria, next) {
		// verificar que el estado del movimiento sea en preparacion
		MovementDetail.findOne(criteria).populate('movement')
			.then(movementDetail => {
				if (!movementDetail) return next();
				if (movementDetail.movement.status > 1) {
					next('Movimiento no esta en preparacion');
				} else {
					next();
				}
			})
			.catch(err => next(err));
	},

	afterCreate(values, next) {
		let resumen = Object.assign({}, values);
		// actualizar searchText
		Product.findOne(values.product)
			.then(product => {
				resumen.searchText = ''.concat(resumen.lot, product.productCode, product.description);
				return MovementDetail.update(resumen.id, {
					searchText: resumen.searchText
				});
			})
			.then(() => this.updateProductPrice(values.product, values.priceItem / values.quantity))
			.then(() => { })
			.catch(() => { });
		next();
	}
};
