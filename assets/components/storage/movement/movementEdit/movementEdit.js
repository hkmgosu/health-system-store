(() => {
	'use strict';
    /**
     * Example
     * <ssvq-storage-movement-edit></ssvq-storage-movement-edit>
     * ejemplo chile compra: http://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?ticket=98D238A3-B18C-4B3E-80F3-82E8E102DA59&codigo=3603-63-CM17
     */
	app.directive('ssvqStorageMovementEdit', function () {
		return {
			controller: ComponentController,
			controllerAs: 'vm',
			bindToController: {},
			scope: {},
			restrict: 'E',
			templateUrl: '/components/storage/movement/movementEdit/movementEdit.html'
		};
	});

	/* @ngInject */
	function ComponentController($scope, $stateParams, $mdDialog, $mdToast, movementFactory, movementTypeFactory, productRequestFactory, unitProductsManagerFactory, unitProductRequestFactory, companyFactory, locationFactory, programFactory, productFactory) {
		var vm = this;
		var vmParent = this;
		window._vm = this;

		vm.programs = [];
		vm.subprogramsView = [];
		vm.destinyUnits = [];
		vm.movement = {};
		vm.isControlled = false;
		vm.cacheCompany = null;
		vm.cacheDestinyUnit = null;

		// requerido para imagen de producto
		vm.timestamp = product => moment((product || {}).updatedAt).format('X');

		// item valido
		vm.itemValid = item => (item.product && item.lot);

		// subprogramas
		function getPrograms() {
			return programFactory.getAll()
				.then(res => {
					vm.programs = res.obj.programs;
					vm.programs.forEach(p => p.program = p.program || null);
				})
				.catch(err => $mdToast.showSimple('Error al obtener los programas' + (console.error(err) || '')));

		};

		// movimiento a editar
		(function getMovement() {
			return getPrograms()
				.then(() => movementFactory.get($stateParams.id))
				.then(res => {
					vm.movement = res.obj.movement;
					vm.cacheCompany = Object.assign({}, vm.movement.company);
					vm.cacheDestinyUnit = Object.assign({}, vm.movement.unit);

					vm.movement.status = vm.movement.status || 1;
					vm.movement.movementType = vm.movement.movementType.id;
					vm.movement.isPharmaceutical = vm.movement.unit.isPharmaceutical;
					vm.movement.unit = vm.movement.unit.id;
					vm.movement.company ? vm.movement.company = vm.movement.company.id : null;
					vm.movement.destinyUnit ?
						vm.movement.destinyUnit = vm.movement.destinyUnit.id : null;
					vm.isControlled = vm.movement.isControlled;
					vm.newStatus = vm.movement.status || 1;

					if (!vm.movement.details) vm.movement.details = [];
				})
				.then(() => $scope.$apply())
				.catch(err => $mdToast.showSimple('Error al obtener movimiento.' + (console.error(err) || '')));
		})();

		// tipos de movimientos
		(function getMovementTypes() {
			return movementTypeFactory.getAll()
				.then(res => vm.movementTypes = res.obj.movementTypes)
				.catch(err => $mdToast.showSimple('Error al obtener tipos de movimiento.' + (console.error(err) || '')));
		})();



		// buscar las unidades a consultar
		function getUnitsEmployee() {
			// unidades asignadas
			let employee = JSON.parse(localStorage.getItem('miSSVQ.me'));
			return productRequestFactory.getOriginUnits()
				.then(res => vm.units = res.obj.units)
				.catch(err => $mdToast.showSimple(
					'Error al obtener las unidades' +
					(console.error(err) || '')
				));
		};

		// entidades externas
		(function getExternalEntities() {
			movementFactory.getExternalUnits()
				.then(res => vm.destinyUnits = res.obj.units)
				.catch(err => $mdToast.showSimple(
					'Error al obtener las unidades externas' +
					(console.error(err) || '')
				));
		})();


		(function getLocations() {
			return getUnitsEmployee()
				.then(() => vm.units.reduce((acum, el) => acum.concat(el.id), []))
				.then(idUnits => locationFactory.getAll({
					where: {
						unit: idUnits
					}
				}))
				.then(res => vm.locations = res.obj.locations)
				.catch(err => $mdToast.showSimple('Error al buscar ubicaciones.' + (console.error(err) || '')));
		})();

		// proveedores
		(function getCompanies() {
			companyFactory.getAll()
				.then(res => vm.companies = res.obj.companies)
				.catch(err => $mdToast.showSimple('Error al obtener las compañías' + (console.log(err) || '')));
		})();


		// calcular precio neto total
		function CalcularNetoTotal() {
			if (!vm.movement.details || !vm.movement.details.length) {
				return vm.movement.priceTotal = 0;
			}
			vm.movement.priceTotal = vm.movement.details.reduce(
				(acum, el) => acum + el.priceItem, 0
			);
			vm.saveGeneral();
		}


		function validateProductDetail(product) {
			if (!product) return null;
			// consultar unidades del producto
			return unitProductsManagerFactory.getProductUnits(product.id)
				.then(obj => {
					// buscar si la bodega esta en las unidades del producto
					let pos = obj.list.find(el => el.unit.id == vm.movement.unit);
					if (!pos) {
						$mdToast.showSimple('El producto no esta asignado a la bodega');
						return null;
					}
					return product;
				})
				.catch(console.error);
		};


		vm.getSubprogram = id => vm.programs.find(el => el.id == id) || null;

		$scope.$watch('vm.movement.datePurchaseOrder', val => {
			if (val && val.getFullYear) vm.movement.yearPurchaseOrder = val.getFullYear();
		});

		$scope.$watch('vm.movement.unit', idUnit => {
			if (!idUnit || !vm.units) return;
			let unit = vm.units.find(el => el.id == idUnit);
			vm.movement.isPharmaceutical = unit.isPharmaceutical;
			if (!vm.movement.isPharmaceutical) vm.movement.isControlled = false;
		});

		$scope.$watchCollection(() => vm.movement.details, details => {
			if (!details) return;

			let oSubprograms = {};
			vm.subprogramsView = [];
			details.forEach(detail => {
				if (detail.subprogram) {
					oSubprograms[detail.subprogram.id] = vm.getSubprogram(detail.subprogram.id);
				}
			});
			for (let id in oSubprograms) {
				vm.subprogramsView.push(oSubprograms[id]);
			}
		});


		vm.dialogProgram = $event => {
			$mdDialog.show({
				targetEvent: $event,
				clickOutsideToClose: true,
				bindToController: false,
				controllerAs: 'vm',
				templateUrl: '/components/storage/movement/movementEdit/dialogProgram.html',
				controller() {
					let vm = this;
					window._dg = this;
					vm.program = 0;
					vm.subprogram = null;
					vm.programs = vmParent.programs;
					vm.cancel = () => $mdDialog.cancel();
					vm.addProgram = () => {
						vmParent.subprogramsView.push(vmParent.getSubprogram(vm.subprogram || vm.program));
						$mdDialog.hide();
					};
				}
			});
		};


		vm.getDetailsBySubprogram = subprogram => {
			if (!vm.movement || !vm.movement.details) return [];
			return vm.movement.details.filter(
				detail => {
					if (!subprogram && !detail.subprogram) return true;
					return detail.subprogram && detail.subprogram.id == subprogram;
				});
		};


		function getProductLots(product, location) {
			return productFactory.getStocks({
				where: {
					unit: location.unit,
					product: product.id,
					location: location.id,
					stock: { '>': 0 }
				}
			}).then(obj => {
				let productLots = {};
				obj.productStocks.forEach(ps => {
					productLots[ps.productLot.id] = Object.assign(
						{ stock: ps.stock }, ps.productLot
					);
				});

				let vm_productLots = [];
				for (let k in productLots) {
					vm_productLots.push(productLots[k])
				}
				return vm_productLots.sort((a, b) => a.expiration < b.expiration ? -1 : 1);
			}).catch(console.error);
		};


		function getPacks(product) {
			return productFactory.getPacks({ product })
				.then(productPacks => {
					console.log('getPacks', productPacks);
					productPacks.forEach(el => {
						if (el.packtype && !el.packtype.id) {
							el.packtype = packTypes.find(pt => pt.id == el.packtype) || {};
						}
					});
					return productPacks;
				})
				.catch(console.error);
		};

		let packTypes = [];
		(function getPackTypes() {
			productFactory.getPackTypes()
				.then(obj => packTypes = obj.packTypes)
				.catch(console.error);
		})();


		// --------------- metodos --------------------
		vm.addDetail = ($event, subprogram) => {
			$mdDialog.show({
				targetEvent: $event,
				clickOutsideToClose: true,
				bindToController: true,
				controllerAs: 'vm',
				templateUrl: '/components/storage/movement/movementEdit/dialogDetail.html',
				controller($mdDialog, $mdToast) {
					let vm = this;
					vm.currentDate = (new Date).toISOString();
					vm.movement = vmParent.movement;
					vm.locations = vmParent.locations.filter(el => el.unit == vmParent.movement.unit) || [];
					vm.detail = {};
					vm.maxQuantity = 0;
					vm.product = null;
					vm.productLots = [];
					vm.productLotSelected = null;
					vm.productPacks = [];
					vm.detail.movement = vmParent.movement.id;
					vm.detail.subprogram = subprogram;
					if (vm.locations.length) vm.detail.location = vm.locations[0].id;

					if (!vmParent.movement.isPharmaceutical) {
						vm.productTypeSearch = 'economato';
					} else {
						vm.productTypeSearch = vmParent.isControlled ?
							'controlado' : 'nocontrolado';
					}

					vm.unitMovement = vmParent.movement.unit;
					vm.weightedPrice = 0;

					vm.onSelectProduct = product => {
						validateProductDetail(product).then(product => {
							vm.detail.product = product;
							if (!product) return;
							vm.weightedPrice = product.weightedPrice;
							vm.detail.priceItem = (vm.detail.quantity || 0) * vm.weightedPrice;
							vm.reloadProductLots();
							getPacks(product.id).then(productPacks => vm.productPacks = productPacks);
						});
					};
					vm.removeProduct = () => vm.detail.product = null;
					vm.reloadProductLots = () => {
						let location = vm.locations.find(el => el.id == vm.detail.location);
						getProductLots(vm.detail.product, location)
							.then(records => vm.productLots = records);
					};

					vm.onSelectLot = (productLot) => {
						vm.detail.lot = productLot ? productLot.lot : null;
						vm.detail.expiration = productLot ? productLot.expiration : null;
						vm.detail.productPack = productLot ? productLot.productPack : null;
						vm.maxQuantity = productLot ? productLot.stock : 0;
					};

					vm.cancel = () => $mdDialog.cancel();
					vm.confirm = () => {
						movementFactory.addDetail(vm.detail)
							.then(res => {
								if (!vmParent.movement.details) {
									vmParent.movement.details = [];
								}
								vmParent.movement.details.push(res.obj.movementDetail);
								CalcularNetoTotal();
								$mdDialog.hide();
							})
							.catch(err => $mdToast.showSimple('Error al crear el detalle de movimiento' + (console.error(err) || '')));
					}
				}
			});
		};


		vm.editDetail = ($event, item) => {
			let detail = Object.assign({}, item);
			$mdDialog.show({
				targetEvent: $event,
				clickOutsideToClose: true,
				bindToController: true,
				controllerAs: 'vm',
				templateUrl: '/components/storage/movement/movementEdit/dialogDetail.html',
				controller($mdDialog, $mdToast) {
					let vm = this;
					window.vmEdit = this;
					vm.currentDate = (new Date).toISOString();
					vm.movement = vmParent.movement;
					vm.locations = vmParent.locations.filter(el => el.unit == vmParent.movement.unit) || [];
					vm.status = vmParent.movement.status;
					vm.detail = detail;
					vm.maxQuantity = 0;
					vm.productLots = [];
					vm.productLotSelected = null;
					vm.detail.movement = vmParent.movement.id;
					vm.detail.location = vm.locations[0].id;
					vm.detail.quantity = Math.abs(vm.detail.quantity || 0);
					vm.weightedPrice = vm.detail.priceItem / (vm.detail.quantity || 1);

					vm.onSelectProduct = product => {
						vm.detail.product = product;
						vm.reloadProductLots();
						getPacks(product.id).then(productPacks => vm.productPacks = productPacks);
					};
					vm.removeProduct = () => vm.detail.product = null;
					vm.reloadProductLots = () => {
						let location = vm.locations.find(el => el.id == vm.detail.location);
						getProductLots(vm.detail.product, location)
							.then(records => {
								vm.productLots = records;
								vm.productLotSelected = records.find(el => el.lot == vm.detail.lot);
								if (!vm.productLotSelected && vm.detail.lot) {
									let item = {
										lot: vm.detail.lot,
										stock: vm.detail.quantity,
										expiration: vm.detail.expiration
									};
									vm.productLots.push(item);
									vm.productLotSelected = item;
									vm.detail.lot = item.lot;
								}
								vm.onSelectLot(vm.productLotSelected);
							});
					};

					vm.onSelectLot = (productLot) => {
						vm.detail.lot = productLot ? productLot.lot : null;
						vm.detail.expiration = productLot ? productLot.expiration : null;
						vm.maxQuantity = productLot ? productLot.stock : null;
					};

					vm.cancel = () => $mdDialog.cancel();
					vm.confirm = () => {
						(vm.detail.product && vm.detail.product.id) ?
							vm.detail.product = vm.detail.product.id : null;
						movementFactory.saveDetail(vm.detail)
							.then(res => {
								for (let i = 0; i < vmParent.movement.details.length; ++i) {
									let detail = vmParent.movement.details[i];
									if (detail.id == res.obj.movementDetail.id) {
										vmParent.movement.details.splice(i, 1, res.obj.movementDetail);
										break;
									}
								}
								CalcularNetoTotal();
								$mdDialog.hide();
							})
							.catch(err => $mdToast.showSimple('Error al editar el detalle de movimiento' + (console.error(err) || '')));
					}

					vm.reloadProductLots();
					getPacks(vm.detail.product.id).then(productPacks => vm.productPacks = productPacks);
				}
			});
		};


		vm.delDetail = ($event, detail) => {
			movementFactory.delDetail(detail.id)
				.then(res => {
					$mdToast.showSimple('Se ha eliminado el detalle de movimiento');
					for (let i = 0; i < vmParent.movement.details.length; ++i) {
						let detail = vmParent.movement.details[i];
						if (detail.id == res.obj.movementDetail.id) {
							vmParent.movement.details.splice(i, 1);
							break;
						}
					}
				})
				.catch(err => $mdToast.showSimple('Error al eliminar el detalle de movimiento' + (console.error(err) || '')));
		};


		vm.onChangeStatus = () => {
			let isValid = vm.movement.details.reduce((acum, el) => acum && vm.itemValid(el), true);
			if (!isValid) {
				vm.newStatus = vm.movement.status || 1;
				return $mdToast.show({
					template: '<md-toast>' +
						'<md-icon md-font-icon="fa fa-exclamation-triangle" style="color: orange;margin: 0;"></md-icon> ' +
						'Tiene itemes incompletos' +
						'</md-toast>'
				});
			}
			movementFactory.update({
				id: vm.movement.id,
				status: vm.newStatus
			}).then(res => {
				vm.movement.status = vm.newStatus;
				$mdToast.showSimple('Se ha cambiado el estado del movimiento.');
			})
				.catch(err => {
					$mdToast.showSimple('Error al cambiar estado del movimiento.' + (console.error(err) || ''));
					vm.newStatus = vm.movement.status || 1;
				});
		};


		vm.saveGeneral = () => {
			let data = Object.assign({}, vm.movement);
			data.isControlled = vm.isControlled;
			delete data.status;
			delete data.details;
			delete data.createdBy;

			movementFactory.update(data)
				.then(res => {
					vm.movement = res.obj.movement;
					$mdToast.showSimple('Se ha guardado los datos generales.');
				})
				.catch(err => {
					$mdToast.showSimple('Error al cambiar estado del movimiento.' + (console.error(err) || ''));
					vm.newStatus = vm.movement.status || 1;
				});
		};
	}
})();
