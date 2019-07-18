(() => {
	'use strict';
    /**
     * Example
     * <ssvq-storage-product-request-detail></ssvq-storage-product-request-detail>
     */
	app.directive('ssvqStorageProductRequestDetail', function () {
		return {
			scope: {}, // importante! para no heredar variables del padre
			controller: ComponentController,
			controllerAs: 'vm',
			bindToController: {
				idDetail: '=',
				isSonUnit: '=',
				change: '&?'
			},
			restrict: 'E',
			templateUrl: '/components/storage/productRequest/productRequestDetail/productRequestDetail.html'
		};
	});

	/* @ngInject */
	function ComponentController($scope, $mdToast, $mdDialog, productRequestFactory, productFactory, storageManagerFactory) {
		var vm = this;
		window.vmDetail = this;

		vm.detail = {};
		vm.shipping = {
			date: moment().startOf('day')
		};
		vm.location = null;
		vm.locations = [];
		vm.productLot = null;
		vm.productLots = [];
		vm.productPacks = [];
		vm.shippings = [];
		vm.waitShipping = false;
		vm.isCreator = false;
		vm.isPharmacyBoss = false;
		vm.isStorageBoss = false;
		vm.canUpdate = false;
		vm.canShipping = false;
		vm.currentDate = (new Date).toISOString();


		//------- cargar ubicaciones de la bodega a la que se solicito -------------------------------
		function getStocks(product, unit) {
			return productFactory.getStocks({
				where: {
					unit: (unit.id || unit),
					product: (product.id || product),
					stock: {
						'>': 0
					}
				}
			}).then(obj => {
				let productStocks = obj.productStocks;
				let locations = {}; // crear objeto para evitar duplicados
				let productLots = {}; // crear objeto para evitar duplicados
				for (let i = 0; i < productStocks.length; ++i) {
					if (!productStocks[i].productLot) continue;

					let k1 = productStocks[i].location.id;
					locations[k1] = productStocks[i].location;
					if (!vm.location) vm.location = k1;

					let k2 = productStocks[i].productLot.id;
					productLots[k2] = {
						id: productStocks[i].productLot.id,
						lot: productStocks[i].productLot.lot,
						productPack: productStocks[i].productLot.productPack,
						expiration: productStocks[i].productLot.expiration,
						location: productStocks[i].location.id,
						stock: productStocks[i].stock,
						productStock: productStocks[i].id
					};
				}

				// convertir objeto en array
				for (let k1 in locations) {
					vm.locations.push(locations[k1]);
				}

				// convertir objeto en array
				vm.productLots = [];
				for (let k2 in productLots) {
					vm.productLots.push(productLots[k2]);
				}

				// ordenar por fecha expiracion
				vm.productLots = vm.productLots.sort((a, b) => {
					let d1 = new Date(a.expiration);
					let d2 = new Date(b.expiration);
					if (d1 == d2) return 0;
					return d1 < d2 ? -1 : 1;
				});
			}).catch(err => $mdToast.showSimple("Error al cargar stocks." + (console.error(err) || '')));
		}; // getStock()


		function getProductPacks(product) {
			productFactory.getPacks({ product: (product.id || product) })
				.then(productPacks => {
					productPacks.forEach(pp => {
						pp.packtype = packTypes.find(pt => pt.id == pp.packtype);
					});
					console.log(productPacks, vm.productLots);
					vm.productLots.forEach(pl => {
						pl.productPack = productPacks.find(pp => pp.id == pl.productPack);
					});
				})
				.catch(console.error);
		};

		let packTypes = [];
		(function getPackTypes() {
			productFactory.getPackTypes()
				.then(obj => packTypes = obj.packTypes)
				.catch(console.error);
		})();


		// identifica si puede actualizar detalle o enviar productos
		function getAuthorizations() {
			let employee = JSON.parse(localStorage.getItem('miSSVQ.me'));
			vm.isPharmacyBoss = false;
			vm.isStorageBoss = false;
			vm.isStorageEmployee = false;
			vm.isCreator = vm.detail.productRequest.createdBy == employee.id ||
				vm.detail.productRequest.originUnit == employee.unit;

			return storageManagerFactory.getAll({
				where: {
					unit: vm.detail.productRequest.destinyUnit,
					employee: employee.id
				}
			}).then(obj => {
				obj.storageManagers.forEach(row => {
					if (!row.isPharmacyBoss) vm.isStorageEmployee = true;
					if (row.isAdmin) vm.isStorageBoss = true;
					if (row.isPharmacyBoss) vm.isPharmacyBoss = true;
				});
				if (vm.detail.productRequest.status == 1 && vm.isCreator) {
					vm.canUpdate = true;
				}
				if (vm.detail.productRequest.status == 2 && vm.isPharmacyBoss) {
					vm.canUpdate = true;
				}
				if (vm.detail.productRequest.status == 2 && vm.isStorageBoss) {
					vm.canUpdate = true;
				}
				if (vm.detail.productRequest.status == 11 && vm.isStorageBoss) {
					vm.canUpdate = true;
				}
				// 12:autorizado o 21:despachado
				if ([12, 21].indexOf(vm.detail.productRequest.status) > -1 && vm.isStorageEmployee) {
					vm.canShipping = true;
				}
			});
		};


		$scope.$watch('vm.idDetail', val => {
			productRequestFactory.getDetail(val)
				.then(res => vm.detail = res.obj.productRequestDetail)
				.then(() => getAuthorizations())
				.then(() => getStocks(vm.detail.product, vm.detail.productRequest.destinyUnit))
				.then(() => getProductPacks(vm.detail.product))
				.then(() => $scope.$apply())
				.catch(err => $mdToast.showSimple("Error al consultar detalle." + (console.error(err) || '')));

			productRequestFactory.getShippings(val)
				.then(res => {
					vm.shippings = res.obj.shippings;
					for (let i = 0; i < vm.shippings.length; ++i) {
						vm.shippings[i].inputReceived = vm.shippings[i].quantitySend;
					}
				})
				.catch(err => $mdToast.showSimple('Error al consultar envios.' + (console.error(err) || '')));
		});

		$scope.$watch('vm.productLot', val => {
			if (val) {
				if (val.expiration && (new Date(val.expiration)) < (new Date())) {
					$mdToast.showSimple('Lote que indicó, está vencido');
					vm.productLot = null;
				}
				let pendiente = vm.getPendientes();
				vm.shipping.originProductStock = val.productStock;
				vm.maxShipping = val.stock > pendiente ? pendiente : val.stock;
			}
		});

		vm.getPendientes = () => {
			let quantitySend = vm.shippings.reduce(
				(acum, s) => acum + (s.quantityReceived || s.quantitySend), 0
			);
			return vm.detail.quantityBoss2 - quantitySend;
		};

		//------------ guardar modificación a cantidad solicitada ----------------
		vm.saveDetail = () => {
			let data = {
				id: vm.detail.id,
				quantity: vm.detail.quantity,
				quantityBoss1: vm.detail.quantityBoss1,
				quantityBoss2: vm.detail.quantityBoss2,
			};
			productRequestFactory.updateDetail(data)
				.then(res => {
					$mdToast.showSimple('Se actualizo la cantidad solicitada');
					vm.change ? vm.change(res.obj.productRequestDetail) : null;
				})
				.catch(err => $mdToast.showSimple("Error al actualizar detalle." + (console.error(err) || '')));
		};

		//------------ agregar envio de productos --------------------------------
		vm.addShipping = () => {
			// truncar la fecha
			vm.shipping.date = moment(vm.shipping.date).startOf('day').toDate();
			vm.shipping.productRequestDetail = vm.detail.id;
			vm.waitShipping = true;
			productRequestFactory.addShipping(vm.shipping)
				.then(() => {
					vm.productLot = null;
					vm.shipping.quantitySend = null;
					getStocks(vm.detail.product, vm.detail.productRequest.destinyUnit);
					vm.waitShipping = false;
					$scope.$apply();
				}).catch(err => {
					vm.waitShipping = false;
					console.error(err);
					let message = (err.raw && err.raw.message) || err.raw || err;
					if (message) return $mdToast.showSimple(message);
					$mdToast.showSimple('Error al agregar envio.');
				});
		};

		//------------ eliminar el envio de productos --------------------------------
		vm.delShipping = ($event, $index) => {
			let id = vm.shippings[$index].id;
			let confirm = $mdDialog.confirm()
				.multiple(true)
				.title('Eliminar envío?')
				.textContent('Se eliminará el registro de envío de producto.')
				.ariaLabel('Eliminar envío')
				.targetEvent($event)
				.ok('Eliminar')
				.cancel('Cancelar');

			$mdDialog.show(confirm).then(() => {
				productRequestFactory.delShipping(id)
					.then(() => getStocks(vm.detail.product, vm.detail.productRequest.destinyUnit))
					.catch(err => {
						console.error(err);
						let message = (err.raw && err.raw.message) || err.raw || err;
						if (message) return $mdToast.showSimple(message);
						$mdToast.showSimple('Error al eliminar envío.');
					});
			}, () => { });
		};

		//------------ guardar cantidad recibida del envio -----------------------
		vm.saveReceived = ($index) => {
			let shipping = {
				id: vm.shippings[$index].id,
				quantityReceived: Number(vm.shippings[$index].inputReceived)
			};

			productRequestFactory.updateShipping(shipping)
				.then(() => $mdToast.showSimple('Se ha guardado la cantidad recibida.'))
				.catch(err => {
					let message = (err.raw && err.raw.message) || err.raw || err;
					if (message) return $mdToast.showSimple(message);
					$mdToast.showSimple('Error al guardar cantidad recibida.' + (console.error(err) || ''));
				});

			if (shipping.quantityReceived < vm.shippings[$index].quantitySend) {
				let dataComment = {
					table: 'productRequestDetail',
					idRecord: vm.detail.id,
					type: 'comment',
					description: vm.shippings[$index].comment
				};
				productRequestFactory.createDetailComment(dataComment)
					.then(() => $mdToast.showSimple('Se ha guardado el comentario.'))
					.catch(err => {
						let message = (err.raw && err.raw.message) || err.raw || err;
						if (message) return $mdToast.showSimple(message);
						$mdToast.showSimple('Error al guardar comentario.' + (console.error(err) || ''));
					});
			}
		};


		// SOCKET
		let socketDetail = event => {
			// console.log(event.id, vm.detail.id, event.data);
			if (event.id !== vm.detail.id) return;
			let shipping = {};
			switch (event.data.message) {
				case 'productRequestDetail:detailUpdated':
					let detail = event.data.data;
					vm.detail.quantity = detail.quantity;
					vm.detail.quantitySend = detail.quantitySend;
					vm.detail.quantityReceived = detail.quantityReceived;
					break;
				case 'productRequestDetail:shippingCreated':
					shipping = event.data.data;
					shipping.inputReceived = shipping.quantitySend;
					vm.shippings.push(shipping);
					vm.detail.quantitySend = shipping.productRequestDetail.quantitySend;
					vm.detail.quantityReceived = shipping.productRequestDetail.quantityReceived;
					break;
				case 'productRequestDetail:shippingUpdated':
					shipping = event.data.data;
					shipping.inputReceived = shipping.quantityReceived;
					for (let i = 0; i < vm.shippings.length; ++i) {
						if (vm.shippings[i].id == shipping.id) {
							vm.shippings.splice(i, 1, shipping);
							break;
						}
					}
					vm.detail.quantitySend = shipping.productRequestDetail.quantitySend;
					vm.detail.quantityReceived = shipping.productRequestDetail.quantityReceived;
					break;
				case 'productRequestDetail:shippingDeleted':
					shipping = event.data.data;
					for (let i = 0; i < vm.shippings.length; ++i) {
						if (vm.shippings[i].id == shipping.id) {
							vm.shippings.splice(i, 1);
							break;
						}
					}
					vm.detail.quantitySend -= shipping.quantitySend;
					vm.detail.quantityReceived -= shipping.quantityReceived;
					break;
			}
			$scope.$apply();
		};


		io.socket.on('productrequestdetail', socketDetail);
		$scope.$on("$destroy", () => {
			if (vm.detail.productRequest.id) productRequestFactory.unsubscribeDetail(vm.detail.id);
			io.socket.off('productrequestdetail', socketDetail);
		});
		// FIN SOCKET
	}
})();
