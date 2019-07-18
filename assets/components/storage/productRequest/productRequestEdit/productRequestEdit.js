(() => {
	'use strict';
    /**
     * Example
     * <ssvq-storage-product-request-edit></ssvq-storage-product-request-edit>
     */
	app.directive('ssvqStorageProductRequestEdit', function () {
		return {
			controller: ComponentController,
			controllerAs: 'vm',
			bindToController: {},
			scope: {},
			restrict: 'E',
			templateUrl: '/components/storage/productRequest/productRequestEdit/productRequestEdit.html'
		};
	});

	/* @ngInject */
	function ComponentController(
		$scope, $stateParams, $mdToast, $mdDialog,
		productRequestFactory, productRequestStatusFactory,
		programFactory, costCenterFactory, storageManagerFactory
	) {
		var vm = this;
		var vmParent = this;
		window._vm = this;

		vm.productTypeSearch = 'todos';
		vm.productRequest = {};
		vm.statusProductRequest = null;
		vm.statuses = [];
		vm.programs = [];
		vm.subprogramsView = [];
		vm.originUnits = [];
		vm.destinyUnits = [];
		vm.costCenters = [];

		vm.commentsView = null;
		vm.comments = null;
		vm.commentDictionary = {
			statusChanged: 'modificó el <b>estado</b> de la solicitud',
			generalChanged: 'modificó los <b>datos generales</b> de la solicitud',
			created: 'creó la solicitud',
			detailCreated: 'agrego un <b>detalle de producto</b> a la solicitud',
			detailUpdated: 'modificó el <b>detalle de productos</b> de la solicitud',
			detailDeleted: 'eliminó un <b>detalle de productos</b> de la solicitud',
			shippingCreated: 'agregó un <b>envío</b> del producto',
			shippingUpdated: 'se registro <b>cantidad recibida</b> de un envío',
			shippingDeleted: 'se <b>eliminó</b> un envío',
			comment: 'agregó un <b>comentario</b>'
		};

		vm.showAll = false;
		vm.setShowAll = () => {
			vm.showAll = true;
			vm.commentsView = vm.comments;
		};

		// requerido para imagen de producto
		vm.timestamp = product => moment((product || {}).updatedAt).format('X');


		// identifica si puede actualizar detalle o enviar productos
		function getAuthorizations() {
			let employee = JSON.parse(localStorage.getItem('miSSVQ.me'));
			vm.isPharmacyBoss = false;
			vm.isStorageBoss = false;
			let idCreator = vm.productRequest.createdBy.id || vm.productRequest.createdBy;
			vm.isCreator = idCreator == employee.id ||
				vm.productRequest.originUnit == employee.unit;

			return storageManagerFactory.getAll({
				where: {
					unit: vm.productRequest.destinyUnit,
					employee: employee.id
				}
			}).then(obj => {
				obj.storageManagers.forEach(row => {
					if (row.isAdmin) vm.isStorageBoss = true;
					if (row.isPharmacyBoss) vm.isPharmacyBoss = true;
				});
			});
		}



		// subprogramas
		function getPrograms() {
			return programFactory.getAll()
				.then(res => {
					vm.programs = res.obj.programs;
					vm.programs.forEach(p => p.program = p.program || null);
				})
				.catch(err => $mdToast.showSimple('Error al obtener los programas' + (console.error(err) || '')));
		};

		// ----------- solicitud ------------------
		(function getProductRequest() {
			let employee = JSON.parse(localStorage.getItem('miSSVQ.me'));
			return getPrograms()
				.then(() => productRequestFactory.get($stateParams.id))
				.then(res => {
					vm.productRequest = res.obj.productRequest;
					vm.originUnits = [vm.productRequest.originUnit];
					vm.destinyUnits = [vm.productRequest.destinyUnit];

					vm.statusProductRequest = vm.productRequest.status.id;
					vm.productRequest.originUnit = vm.productRequest.originUnit.id;
					vm.productRequest.destinyUnit = vm.productRequest.destinyUnit.id;

					if (vm.productRequest.costCenter && vm.productRequest.costCenter.id) {
						vm.productRequest.costCenter = vm.productRequest.costCenter.id;
					}
					if (!vm.productRequest.details) vm.productRequest.details = [];
				})
				.then(() => getAuthorizations())
				.then(() => getStatuses())
				.then(() => $scope.$apply())
				.catch(err => $mdToast.showSimple('Solicitud de producto no existe!' + (console.error(err) || '')));
		})();




		vm.getStorageUnits = () => vm.destinyUnits;




		// estados de solicitud
		function getStatuses() {
			return productRequestStatusFactory.getAll()
				.then(res => vm.statuses = res.obj.productRequestStatuses)
				.catch(err => $mdToast.showSimple('Error al obtener los estados' + (console.error(err) || '')));
		};





		// estados permitidos
		vm.getAllowedStatuses = () => vm.statuses.filter(status => {
			if (status.id == vm.productRequest.status.id) return true;
			if (vm.isCreator) {
				let hasDetail = vm.productRequest.details && vm.productRequest.details.length;
				if (status.id == 1 && vm.productRequest.status.id == 2) return true;
				if (status.id == 2 && vm.productRequest.status.id == 1 && hasDetail) return true;
				if (status.id == 34 && vm.productRequest.status.id == 1) return true;
				if (status.id == 31 && vm.productRequest.status.id == 21) return true;
			}
			if (vm.isPharmacyBoss && vm.productRequest.isPharmaceutical) {
				if (status.id == 2 && vm.productRequest.status.id == 11) return true;
				if (status.id == 11 && vm.productRequest.status.id == 2) return true;
				if (status.id == 33 && vm.productRequest.status.id == 2) return true;
			}
			if (vm.isStorageBoss && !vm.productRequest.isPharmaceutical) {
				if (status.id == 2 && vm.productRequest.status.id == 12) return true;
				if (status.id == 12 && vm.productRequest.status.id == 2) return true;
				if (status.id == 33 && vm.productRequest.status.id == 2) return true;
			}
			if (vm.isStorageBoss && vm.productRequest.isPharmaceutical) {
				if (status.id == 12 && vm.productRequest.status.id == 11) return true;
				if (status.id == 33 && vm.productRequest.status.id == 11) return true;
			}
			// si la solicitud va a la unidad padre, se salta al jefe de farmacia
			if (vm.isStorageBoss && vm.productRequest.status.id == 2) {
				let originUnit = vm.originUnits.find(el => el.id == vm.productRequest.originUnit);
				if (status.id == 12 && originUnit.parent == vm.productRequest.destinyUnit) return true;
			}
			return false;
		});






		// centros de costo
		(function getCostCenters() {
			return costCenterFactory.getAll()
				.then(res => vm.costCenters = res.obj.costCenters)
				.catch(err => $mdToast.showSimple('Error al obtener los centros de costo' + (console.error(err) || '')));
		})();




		// comentarios solicitud
		(function getComments() {
			return productRequestFactory.getComments($stateParams.id)
				.then(res => vm.comments = res.obj.comments)

				// comentarios detalles de solicitud
				.then(() => productRequestFactory.getDetailComments($stateParams.id))
				.then(res => vm.comments = vm.comments.concat(res.obj.comments))
				.catch(err => $mdToast.showSimple('Error al obtener los comentarios' + (console.error(err) || '')));
		})();



		// actualiza estado de la solicitud en la pantalla
		function getNewStatus(id) {
			return productRequestFactory.get(id)
				.then(res => {
					vm.productRequest.status = Object.assign({}, res.obj.productRequest.status);
					vm.statusProductRequest = res.obj.productRequest.status.id;
					$scope.$apply();
				})
				.catch(console.error);
		};

		vm.getNewStatus = getNewStatus;




		vm.getDetailsBySubprogram = subprogram => {
			if (!vm.productRequest || !vm.productRequest.details) return [];
			return vm.productRequest.details.filter(
				detail => {
					if (!subprogram && !detail.subprogram) return true;
					return detail.subprogram && detail.subprogram.id == subprogram;
				});
		};



		vm.getSubprogram = id => vm.programs.find(el => el.id == id) || null;



		vm.getStatusDetail = detail => {
			if (detail.quantitySend && detail.quantityBoss2) {
				if (!detail.quantityReceived) {
					return '<span class="product-request-detail enviado">Enviado</span>';
				} else if (detail.quantityReceived < detail.quantityBoss2) {
					return '<span class="product-request-detail pendiente">Pendiente</span>';
				} else {
					return '<span class="product-request-detail recibido">Recibido</span>';
				}
			} else {
				return '<span class="product-request-detail solicitado">Solicitado</span>';
			}
		};


		vm.onChangeStatus = () => {
			productRequestFactory.update({
				id: $stateParams.id,
				status: vm.statusProductRequest
			}).then(res => {
				vm.statusProductRequest = vm.productRequest.status.id;
				vm.productRequest.details = res.obj.productRequest.details;
				$mdToast.showSimple('Se modificó el estado de la solicitud');
			})
				.catch(err => {
					vm.statusProductRequest = vm.productRequest.status.id;
					if (err && err.raw && err.raw.message) {
						$mdToast.showSimple(err.raw.message);
					} else {
						$mdToast.showSimple('Error al cambiar estado' + (console.error(err) || ''));
					}
				});
		};


		vm.saveGeneral = () => {
			let data = Object.assign({}, vm.productRequest);
			delete data.status;

			productRequestFactory.update(data)
				.then(results => {
					$mdToast.showSimple('Se guardaron los datos generales');
				})
				.catch(err => $mdToast.showSimple('Error al guardar los datos generales' + (console.log(err) || '')));
		};


		vm.dialogProgram = $event => {
			$mdDialog.show({
				targetEvent: $event,
				clickOutsideToClose: true,
				bindToController: false,
				controllerAs: 'vm',
				templateUrl: '/components/storage/productRequest/productRequestEdit/dialogProgram.html',
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


		vm.newDetail = ($event, subprogram) => {
			$mdDialog.show({
				targetEvent: $event,
				clickOutsideToClose: true,
				bindToController: false,
				controllerAs: 'vm',
				templateUrl: '/components/storage/productRequest/productRequestEdit/dialogNewDetail.html',
				controller() {
					let vm = this;
					vm.timestamp = vmParent.timestamp;
					vm.exclude = vmParent.productRequest.details.reduce(
						(acum, item) => {
							if (!!item.subprogram) {
								if (item.subprogram.id == subprogram) {
									acum.push(item.product.id);
								}
							} else if (!subprogram) {
								acum.push(item.product.id);
							}
							return acum;
						}, []);
					if (vmParent.productRequest.isPharmaceutical) {
						if (vmParent.productRequest.isControlled) {
							vm.productTypeSearch = 'controlado';
						} else {
							vm.productTypeSearch = 'nocontrolado';
						}
					} else {
						vm.productTypeSearch = 'economato';
					}

					vm.cancel = () => $mdDialog.cancel();
					vm.saveDetail = () => {
						vm.detail.quantityBoss2 = vm.detail.quantityBoss1 = vm.detail.quantity;
						productRequestFactory.addDetail(vm.detail)
							.then(res => $mdDialog.hide())
							.catch(err => $mdToast.showSimple('Error al agregar producto solicitado' + (console.error(err) || '')))
					};

					vm.onSelectProduct = product => {
						vm.isInvalid = false;
						if (!product.isControlled != !vmParent.productRequest.isControlled) {
							if (!!product.isControlled) {
								$mdToast.showSimple('Producto indicado es controlado');
							} else {
								$mdToast.showSimple('Producto indicado no es controlado');
							}
							vm.isInvalid = true;
						}
					};

					vm.detail = {
						productRequest: vmParent.productRequest.id,
						subprogram: subprogram,
						product: null,
						status: 1,
						quantity: 1,
						quantityBoss1: 1,
						quantityBoss2: 1,
						quantityReceived: 0,
						shippings: []
					};
				}
			});
		};


		vm.editDetail = ($event, detail) => {
			$mdDialog.show({
				targetEvent: $event,
				clickOutsideToClose: true,
				bindToController: false,
				controllerAs: 'vm',
				templateUrl: '/components/storage/productRequest/productRequestEdit/dialogEditDetail.html',
				controller: function ($mdDialog) {
					let vm = this;
					vm.detail = detail;

					let originUnit = vmParent.originUnits.find(el => el.id == vmParent.productRequest.originUnit);

					vm.isSonUnit = originUnit.parent == vmParent.productRequest.destinyUnit;

					vm.cancel = () => $mdDialog.cancel();
					vm.changeDetail = newDetail => {
						let $index = vmParent.productRequest.details
							.findIndex(el => el.id == newDetail.id);
						if ($index >= 0) vmParent.productRequest.details.splice($index, 1, newDetail);
						$mdDialog.hide();
					};
				}
			});
		};


		vm.delDetail = ($event, id) => {
			$mdDialog.show($mdDialog.confirm()
				.title('Detalle de solicitud')
				.ariaLabel('Detalle de solicitud')
				.textContent('Desea eliminar el registro?')
				.ok('Eliminar')
				.cancel('Cancelar')
			).then(yes => productRequestFactory.delDetail(id)
				.then(res => $mdToast.showSimple('Se eliminó el detalle'))
				.catch(err => {
					if (err.raw) return $mdToast.showSimple(err.raw);
					$mdToast.showSimple('No se eliminó el detalle' + (console.log(err) || ''));
				}),
				no => { }
			);
		};


		vm.sendComment = comment => new Promise((resolve, reject) => {
			comment.table = 'productRequest';
			comment.idRecord = vm.productRequest.id;
			productRequestFactory.createComment(comment).then(resolve, reject);
		});


		// SOCKET
		let socketProductRequest = event => {
			if (event.id != Number($stateParams.id)) return;
			if (event.data.message == 'productRequest:statusChanged') {
				let idStatus = event.data.data.status.id || event.data.data.status;
				vm.productRequest.status = vm.statuses.find(el => el.id == idStatus);
				vm.statusProductRequest = idStatus;
			}
			if (event.data.message == 'productRequest:generalChanged') {
				let data = event.data.data;
				vm.productRequest.originUnit = data.originUnit.id;
				vm.productRequest.destinyUnit = data.destinyUnit.id;
				vm.productRequest.subprogram = data.subprogram.id;
				vm.productRequest.costCenter = data.costCenter.id;
				vm.productRequest.date = data.date;
				vm.productRequest.glosa = data.glosa;
			}
			if (event.data.message == 'productRequest:comment') {
				vm.comments.unshift(event.data.data);
			}
			if (event.data.message == 'productRequest:detailCreated') {
				vm.productRequest.details.push(event.data.data);
			}
			if (event.data.message == 'productRequest:detailDeleted') {
				let newDetail = event.data.data;
				for (let i = 0; i < vm.productRequest.details.length; ++i) {
					if (vm.productRequest.details[i].id == newDetail.id) {
						vm.productRequest.details.splice(i, 1);
						break;
					}
				}
			}
			$scope.$apply();
		};

		let socketDetail = event => {
			let idDetails = vm.productRequest.details.reduce((acum, el) => acum.concat(el.id), []);
			if (idDetails.indexOf(event.id) == -1) return;

			let shipping = event.data.data;
			let newDetail = shipping.productRequestDetail || shipping;

			if (event.data.message == 'productRequestDetail:detailUpdated') {
				for (let i = 0; i < vm.productRequest.details.length; ++i) {
					if (vm.productRequest.details[i].id == newDetail.id) {
						let item = Object.assign({}, vm.productRequest.details[i], newDetail);
						vm.productRequest.details.splice(i, 1, item);
						newDetail = null;
						break;
					}
				}
				if (newDetail) vm.productRequest.details.push(newDetail);
			}
			if (event.data.message == 'productRequestDetail:shippingCreated') {
				let shipping = event.data.data;
				newDetail = shipping.productRequestDetail;
				for (let i = 0; i < vm.productRequest.details.length; ++i) {
					if (vm.productRequest.details[i].id == newDetail.id) {
						let item = vm.productRequest.details[i];
						item.hasProblemShipping = newDetail.hasProblemShipping;
						item.quantitySend = shipping.quantitySend;
						vm.productRequest.details.splice(i, 1, item);
						break;
					}
				}
				if (vm.productRequest.status.id != 21) {
					getNewStatus(vm.productRequest.id);
				}
			}
			if (event.data.message == 'productRequestDetail:shippingUpdated') {
				for (let i = 0; i < vm.productRequest.details.length; ++i) {
					if (vm.productRequest.details[i].id == newDetail.id) {
						let item = vm.productRequest.details[i];
						item.hasProblemShipping = newDetail.hasProblemShipping;
						item.quantityReceived = newDetail.quantityReceived;
						item.quantitySend = newDetail.quantitySend;
						vm.productRequest.details.splice(i, 1, item);
						break;
					}
				}
				if (vm.productRequest.status.id == 21) {
					getNewStatus(vm.productRequest.id);
				}
			}
			if (event.data.message == 'productRequestDetail:shippingDeleted') {
				for (let i = 0; i < vm.productRequest.details.length; ++i) {
					if (vm.productRequest.details[i].id == newDetail.id) {
						let item = vm.productRequest.details[i];
						item.hasProblemShipping = newDetail.hasProblemShipping;
						item.quantityReceived = newDetail.quantityReceived;
						item.quantitySend = newDetail.quantitySend;
						vm.productRequest.details.splice(i, 1, item);
						break;
					}
				}
				if (vm.productRequest.status.id == 21) {
					getNewStatus(vm.productRequest.id);
				}
			}
			if (event.data.message == 'productRequestDetail:comment') {
				vm.comments.unshift(event.data.data);
			}
			$scope.$apply();
		};

		io.socket.on('productrequest', socketProductRequest);
		io.socket.on('productrequestdetail', socketDetail);
		$scope.$on("$destroy", () => {
			if (vm.productRequest.id) {
				productRequestFactory.unsubscribe(vm.productRequest.id);
			}
			io.socket.off('productrequest', socketProductRequest);
			io.socket.off('productrequestdetail', socketDetail);
		});

		$scope.$watchCollection(() => vm.comments, comments => {
			if (comments) {
				if (vm.showAll) {
					vm.commentsView = comments;
				} else {
					vm.commentsView = comments.slice(0, 3);
				}
			}
		});

		$scope.$watchCollection(() => vm.productRequest.details, details => {
			if (details) {
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
			}
		});
		// FIN SOCKET
	}
})();
