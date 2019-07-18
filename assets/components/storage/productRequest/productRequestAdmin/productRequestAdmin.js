(() => {
	'use strict';
    /**
     * Example
     * <ssvq-storage-product-request-admin></ssvq-storage-product-request-admin>
     */
	app.directive('ssvqStorageProductRequestAdmin', () => {
		return {
			controller: ComponentController,
			controllerAs: 'vm',
			bindToController: {
				mode: '@'
			},
			scope: {},
			restrict: 'E',
			templateUrl: '/components/storage/productRequest/productRequestAdmin/productRequestAdmin.html'
		};
	});

	/* @ngInject */
	function ComponentController($scope, $mdSidenav, $mdDialog, $mdToast, costCenterFactory, unitProductRequestFactory, programFactory, productRequestFactory, productRequestStatusFactory) {
		var vm = this;
		window._vm = this;
		var vmParent = this;

		vm.filter = {
			searchText: null,
			searchCostCenter: null,
			searchMovementType: null,
			minDate: null,
			maxDate: null
		};

		vm.originUnits = [];
		vm.destinyUnits = [];
		vm.programs = [];
		vm.costCenters = [];
		vm.movementTypes = [];
		vm.productRequestStatuses = [];

		vm.page = {};
		vm.limit = 20;
		vm.openStatuses = [];
		vm.pendingStatuses = [];
		vm.closedStatuses = [];
		vm.allStatuses = [];
		vm.unitsEmployee = [];

		vm.formatDate = ddate => (new Date(ddate)).toLocaleDateString("es", {
			timeZone: "UTC"
		});

		// se muestra y oculta el filtro cuando esta en modo celular
		vm.toggleFilter = function () {
			$mdSidenav('srequest-filter').toggle();
		};

		// limpiar el filtro
		vm.cleanFilter = () => {
			vm.filter.searchCostCenter = null;
			vm.filter.searchMovementType = null;
			vm.filter.searchText = null;
			vm.filter.minDate = null;
			vm.filter.maxDate = null;
			vm.refreshAll();
		};

		// Mostrar filtro de fecha creación
		vm.showCreatedAtFilter = ($event) => {
			$mdDialog.show({
				targetEvent: $event,
				templateUrl: '/components/storage/productRequest/productRequestAdmin/rangeDate.html',
				controller: function ($mdDialog) {
					var vm = this;
					vm.filter = Object.assign({}, vmParent.filter);

					vm.confirm = () => {
						vmParent.filter.minDate = vm.filter.minDate;
						vmParent.filter.maxDate = vm.filter.maxDate;
						vmParent.refreshAll();
						$mdDialog.hide();
					};
					vm.cancel = () => {
						$mdDialog.hide();
					};
				},
				controllerAs: 'vm'
			});
		};


		// busca todos los estados de las solicitudes
		function getStatuses() {
			return productRequestStatusFactory.getAll()
				.then(res => {
					vm.productRequestStatuses = res.obj.productRequestStatuses;
					// cuando los estados hallan sido leidos, entonces se consultan las solicitudes
					vm.refreshAll()
				},
					err => $mdToast.showSimple('Error al consultar los estados' + (console.error(err) || ''))
				);
		};

		// buscar las unidades a consultar
		function getUnitsEmployee() {
			// unidades asignadas
			let employee = JSON.parse(localStorage.getItem('miSSVQ.me'));
			vm.unitsEmployee.push(employee.unit);

			return productRequestFactory.getOriginUnits()
				.then(res => vm.originUnits = res.obj.units)
				.then(units => vm.unitsEmployee = vm.unitsEmployee.concat(units.map(el => el.id)))
				.catch(err => $mdToast.showSimple('Error al obtener las unidades' + (console.error(err) || '')));
		};

		getStatuses()
			.then(() => getUnitsEmployee())
			.then(() => vm.refreshAll());

		// consulta la siguiente pagina de resultado
		vm.nextPage = statusParent => {
			if (vm.productRequestStatuses.length == 0) return null;
			if (!vm.originUnits || vm.originUnits.length == 0) return null;

			let keyPage = 'status_' + (statusParent || 'all');
			vm.page[keyPage] = vm.page[keyPage] || 0;
			if (vm.found && Math.ceil(vm.found / vm.limit) <= vm.page[keyPage]) {
				return null;
			}

			vm.page[keyPage] += 1;

			// buscar los estados de acuerdo al estado padre
			let statuses = vm.productRequestStatuses.filter(el => el.statusParent == statusParent);


			let params = {};
			params.page = vm.page[keyPage];
			params.limit = vm.limit;

			let where = {};
			where.or = [{
				originUnit: vm.originUnits.map(el => el.id)
			},
			{
				destinyUnit: vm.unitsEmployee
			}
			];
			if (vm.filter.searchText) params.filter = vm.filter.searchText;
			if (statusParent) where.status = statuses.map(el => el.id);
			if (vm.filter.searchCostCenter) where.costCenter = vm.filter.searchCostCenter;
			if (vm.filter.searchMovementType) where.movementType = vm.filter.searchMovementType;
			if (vm.filter.minDate || vm.filter.maxDate) where.createdAt = {};
			if (vm.filter.minDate) where.createdAt['>='] = vm.filter.minDate;
			if (vm.filter.maxDate) where.createdAt['<='] = vm.filter.maxDate;

			if (where) params.where = where;

			vm.promise = productRequestFactory.getAll(params, true).then(
				data => {
					if (statusParent === 1) {
						vm.openStatuses = (vm.openStatuses || []).concat(data.obj.productRequests);
					} else if (statusParent === 2) {
						vm.pendingStatuses = (vm.pendingStatuses || []).concat(data.obj.productRequests);
					} else if (statusParent === 10) {
						vm.closedStatuses = (vm.closedStatuses || []).concat(data.obj.productRequests);
					} else {
						vm.allStatuses = (vm.allStatuses || []).concat(data.obj.productRequests);
					}
					vm.found = data.obj.found;
					$scope.$apply();
				},
				err => console.log(err)
			);
		};

		// actualiza array de solicitudes con la información nueva o modificada
		vm.refreshAll = () => {
			vm.page = {};
			vm.openStatuses = [];
			vm.pendingStatuses = [];
			vm.closedStatuses = [];
			vm.allStatuses = [];

			vm.nextPage(1);
			vm.nextPage(2);
			vm.nextPage(10);
			vm.nextPage(null);
		};



		// bodegas asignadas
		(function getDestinyUnits() {
			let employee = JSON.parse(localStorage.getItem('miSSVQ.me'));
			return unitProductRequestFactory.getAll({
				where: {
					employee: employee.id
				}
			}).then(res => vm.destinyUnits = res.obj.unitProductRequests.reduce(
				(acum, el) => acum.concat(el.unit), []))
				.catch(err => $mdToast.showSimple('Error al obtener las bodegas' + (console.error(err) || '')));
		})();


		// programas / subprogramas
		(function getPrograms() {
			return programFactory.getAll()
				.then(res => vm.programs = res.obj.programs)
				.catch(err => $mdToast.showSimple('Error al obtener los programas' + (console.error(err) || '')));
		})();


		// centros de costo
		(function getCostCenters() {
			return costCenterFactory.getAll()
				.then(res => vm.costCenters = res.obj.costCenters)
				.catch(err => $mdToast.showSimple('Error al obtener los centros de costo' + (console.error(err) || '')));
		})();


		// abre dialogo de edición de solicitud
		vm.openCreate = $event => {
			$mdDialog.show({
				targetEvent: $event,
				clickOutsideToClose: true,
				bindToController: true,
				locals: {
					dialogConfirm: vm.dialogConfirm,
					vmParent: vm
				},
				controllerAs: 'vm',
				templateUrl: '/components/storage/productRequest/productRequestAdmin/dialogCreate.html',
				controller($scope, $mdDialog, $mdToast) {
					let vm = this;
					vm.productRequest = {};
					vm.originUnits = vmParent.originUnits;
					vm.destinyUnits = vmParent.destinyUnits;
					vm.programs = vmParent.programs;
					vm.costCenters = vmParent.costCenters;
					vm.movementTypes = vmParent.movementTypes;
					vm.productRequestStatuses = vmParent.productRequestStatuses;
					vm.productRequest.date = moment().format('YYYY-MM-DD');
					if (vm.originUnits.length) vm.productRequest.originUnit = vm.originUnits[0].id;
					if (vm.destinyUnits.length) vm.productRequest.destinyUnit = vm.destinyUnits[0].id;

					$scope.$watch('vm.productRequest.destinyUnit', val => {
						let unit = vm.destinyUnits.find(el => el.id == vm.productRequest.destinyUnit);
						vm.productRequest.isPharmaceutical = unit.isPharmaceutical || false;
					});

					vm.cancel = () => $mdDialog.cancel();

					vm.confirm = () => {
						productRequestFactory.create(vm.productRequest)
							.then(res => {
								$mdDialog.hide();
								document.location.href = '#/bodega/solicitud-productos/' + res.obj.productRequest.id;
							})
							.catch(err => $mdToast.showSimple('Error al crear la solicitud de producto' + (console.error(err) || '')));
					}
				}
			});
		};
	}
})();
