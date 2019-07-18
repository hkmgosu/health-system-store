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
		movementType: {
			model: 'MovementType',
			required: true
		},
		unit: {
			model: 'Unit',
			required: true
		},
		destinyUnit: {
			model: 'Unit'
		},
		status: {
			type: 'integer',
			required: true,
			defaultsTo: 1
		},
		date: {
			type: 'date',
			required: true,
			defaultsTo: new Date()
		},

		details: {
			collection: 'MovementDetail',
			via: 'movement'
		},

		// documents
		numShippingOrder: {
			type: 'string',
			size: 20
		},
		numDonation: {
			type: 'string',
			size: 20
		},
		donatedBy: {
			type: 'string',
			size: 20
		},
		numRequest: {
			type: 'string',
			size: 20
		},
		numInvoice: 'integer',
		idChileCompra: {
			type: 'string',
			size: 20
		},
		numPurchaseOrder: 'integer',
		datePurchaseOrder: 'date',
		yearPurchaseOrder: 'integer',
		priceTotal: {
			type: 'integer',
			defaultsTo: 0
		},
		// documents: fin

		company: {
			model: 'Company'
		},
		createdBy: {
			model: 'employee',
			required: true
		},

		isInput: 'boolean',
		isOutput: 'boolean',
		isPharmaceutical: 'boolean',
		isControlled: 'boolean',

		deleted: {
			type: 'boolean',
			defaultsTo: false
		}
	},

	beforeCreate(values, next) {
		// si no es prestamo, la entidad es nula
		if (values.movementType !== 3) values.destinyUnit = null;
		next();
	},


	afterUpdate(values, next) {
		if (!values.id) return next();
		let model = this;

		sails.log.info('Movement.afterUpdate', values);

		Movement.findOne(values.id)
			.populate('details')
			.populate('destinyUnit')
			.then(movement => {
				// si no se ha cambiado estado, no hacer nada
				if ((movement.status || 1) != 2) return;
				let promises = [];

				// actualizar el stock de la bodega
				movement.details.forEach(detail => {
					promises.push(cb => model.updateStock(detail, movement.unit).then(cb));
				});

				// si la unidad destino es una bodega, actualizar stock de esa bodega
				if (movement.destinyUnit && movement.destinyUnit.storage) {
					movement.details.forEach(detail => {
						promises.push(cb => model.updateStock(detail, movement.destinyUnit.id).then(cb));
					});
				}
				async.series(promises, (err, results) => {
					if (err) return err && sails.log.error(err);

					sails.log.info("calculate wheightprice ", movement.id);
					sails.log.info("movement", movement);

					// segun reglas de negocio
					if (movement.status === 2 && new Date(movement.date).getYear() === new Date().getYear()) {
						sails.log.info("calculating ", new Date().getYear());
						// extraer id de productos para calcular precio ponderado
						let productForUpdate = _.uniq(_.map(movement.details, 'product'));
						sails.log.info("products for update", productForUpdate);
						// buscar todos los detalles donde se encuentran estos productos
						MovementDetail.find({
							product: productForUpdate
						}).then(allDetails => {
							let productWP = [];
							productForUpdate.forEach(productId => {
								sails.log.info(`producto: ${productId}`)
								let movementDetailProducts = [];
								allDetails.forEach(aD => {
									sails.log.info("product in allDetails ", aD.product);
									if (aD.product === productId) movementDetailProducts.push(aD)
								});
								sails.log.info("movementDetailProducts", movementDetailProducts);

								let productPrice = 0;
								let productQuantity = 0;
								let productPrices = _.map(movementDetailProducts || [], 'priceItem');
								let productQuantities = _.map(movementDetailProducts || [], 'quantity');
								productPrices.forEach(pPrice => productPrice = productPrice + pPrice);
								productQuantities.forEach(pQuantity => productQuantity = productQuantity + pQuantity);
								sails.log.info(`Price: ${productPrice} Quantity: ${productQuantity}`)
								let productWeightedPrice = productPrice / productQuantity;
								sails.log.info(`weighted for product ${productId}: ${productWeightedPrice}`);
								productWP.push({
									product: productId,
									weightedPrice: productWeightedPrice
								});
							});
							return productWP;
						}).then(productWeightedPrices => {
							sails.log.info("updates products", productWeightedPrices);
							let productUpdates = [];
							productWeightedPrices.forEach(wprice => productUpdates.push(Product.update({
								id: wprice.product
							}, {
									weightedPrice: Math.round(wprice.weightedPrice)
								})));
							return Promise.all(productUpdates)
						}).then(results => {
							sails.log.info("ACTUALIZADOS", results);
						}).catch(err => sails.log.error("error on calculate product wheitedPrice", err));
					} else {
						sails.log.info("product prices WITHOUT UPDATES");
					}

					sails.log.info("END PRODUCT UPDATE WEIGHTEDPRICE")
				});
			})
			.catch(err => err && sails.log.error('afterUpdate', err));

		next();
	},

	updateStock(detail, idUnit) {
		let resume = {};
		return ProductLot.findOne({
			product: detail.product,
			lot: detail.lot
		}).then(productLot => {
			if (!productLot) {
				return ProductLot.create({
					product: detail.product,
					lot: detail.lot,
					expiration: detail.expiration,
					productPack: detail.productPack
				});
			} else {
				productLot.productPack = detail.productPack;
				productLot.save(err => err && sails.log.error('ERROR al actualizar productLot', err));
				return productLot;
			}
		}).then(productLot => {
			resume.productLot = productLot;
			return ProductStock.findOne({
				productLot: productLot.id,
				product: productLot.product,
				unit: idUnit
			});
		}).then(productStock => {
			if (!productStock) {
				return ProductStock.create({
					productLot: resume.productLot.id,
					location: detail.location,
					product: detail.product,
					unit: idUnit,
					stock: 0
				});
			} else {
				return productStock;
			}
		}).then(productStock => {
			productStock.stock = productStock.stock + detail.quantity;
			productStock.save(err => err && sails.log.error(err));
		});
	}
};
