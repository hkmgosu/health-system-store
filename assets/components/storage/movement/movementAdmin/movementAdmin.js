(() => {
	"use strict";
	/**
	 * Example
	 * <ssvq-storage-movement-admin></ssvq-storage-movement-admin>
	 */
	app.directive("ssvqStorageMovementAdmin", function () {
		return {
			controller: ComponentController,
			controllerAs: "vm",
			bindToController: {},
			scope: {},
			restrict: "E",
			templateUrl:
				"/components/storage/movement/movementAdmin/movementAdmin.html"
		};
	});

	/* @ngInject */
	function ComponentController(
		$scope,
		$mdToast,
		$mdSidenav,
		$mdDialog,
		movementTypeFactory,
		movementFactory,
		productRequestFactory,
		companyFactory
	) {
		//
		var vm = this;
		var vmParent = this;
		window._vm = this;
		vm.viewMode = "list";
		vm.limit = 15;
		vm.page = 0;
		vm.searchText = "";
		vm.searchTypes = [];
		vm.units = [];
		vm.destinyUnits = [];


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

		vm.toggleFilter = () => {
			$mdSidenav("movements-filter").toggle();
		};

		// ------ buscar los movimientos ----------
		vm.nextPage = () =>
			new Promise((resolve, reject) => {
				let employee = JSON.parse(localStorage.getItem("miSSVQ.me"));

				if (vm.found && Math.ceil(vm.found / vm.limit) <= vm.page) {
					return resolve();
				}
				vm.page += 1;

				let criteria = {
					limit: vm.limit,
					page: vm.page,
					filter: vm.searchText,
					where: {
						status: [1, 2], // 1:en preparacion, 2:confirmado, 10:anulado
						movementType: vm.searchTypes,
						unit: vm.units.map(el => el.id)
					}
				};

				if (vm.minDate || vm.maxDate) criteria.where.createdAt = {};
				if (vm.minDate)
					criteria.where.createdAt[">="] =
						vm.minDate.toISOString().substr(0, 10) + "T00:00:00";
				if (vm.maxDate)
					criteria.where.createdAt["<="] =
						vm.maxDate.toISOString().substr(0, 10) + "T23:59:59";

				vm.promise = movementFactory
					.getAll(criteria)
					.then(res => {
						vm.movements = (vm.movements || []).concat(
							res.obj.movements
						);
						vm.found = res.obj.found;
						$scope.$apply();
						resolve();
					})
					.catch(err => {
						console.error(err);
						reject(err);
					});
			});

		// ------- buscar los tipos de movimiento ------
		function getMovementTypes() {
			return movementTypeFactory
				.getAll()
				.then(res => (vm.movementTypes = res.obj.movementTypes))
				.catch(err => console.error(err));
		}

		getUnitsEmployee()
			.then(() => getMovementTypes())
			.then(() => {
				vm.searchTypes = vm.movementTypes.map(el => el.id);
				vm.nextPage()
					.then(() => { })
					.catch(console.error);
			})
			.catch(console.error);

		//----- cambiar el modo de vista -------------
		vm.viewChange = () => {
			vm.viewMode = vm.viewMode == "list" ? "table" : "list";
			if (vm.viewMode == "list") {
				vm.page = 0;
				vm.movements = null;
				vm.nextPage().then(() => { }, () => { });
			} else {
				vm.page--;
				vm.movements = null;
				vm.nextPage().then(() => { }, () => { });
			}
		};

		//--------- pagina siguiente en modo table -----------
		vm.nextTable = () => {
			vm.page--;
			vm.movements = null;
			vm.nextPage().then(() => { }, () => { });
		};

		//---------- limpiar busqueda --------------
		vm.cleanSearch = () => {
			vm.searchText = "";
			vm.searchTypes = vm.movementTypes.reduce(
				(acum, el) => acum.concat(el.id),
				[]
			);
			vm.minDate = null;
			vm.maxDate = null;
			vm.page = 0;
			vm.movements = null;
			vm.nextPage()
				.then(() => { })
				.catch(() => { });
		};

		//----------- check de filtro --------------
		vm.toggleType = id => {
			let pos = vm.searchTypes.indexOf(id);
			pos >= 0 ? vm.searchTypes.splice(pos, 1) : vm.searchTypes.push(id);
			vm.page = 0;
			vm.movements = null;
			vm.nextPage().then(() => { }, () => { });
		};

		vm.refreshSearch = () => {
			vm.page = 0;
			vm.movements = null;
			vm.nextPage().then(() => { }, () => { });
		};

		// Mostrar filtro de fecha creación
		vm.showCreatedAtFilter = $event => {
			$mdDialog.show({
				targetEvent: $event,
				templateUrl:
					"/components/storage/movement/movementAdmin/rangeDate.html",
				controller: function ($mdDialog) {
					var vm = this;
					vm.minDate = vmParent.minDate || null;
					vm.maxDate = vmParent.maxDate || null;

					vm.confirm = () => {
						vmParent.minDate = vm.minDate;
						vmParent.maxDate = vm.maxDate;
						vmParent.refreshSearch();
						$mdDialog.hide();
					};
					vm.cancel = () => {
						$mdDialog.hide();
					};
				},
				controllerAs: "vm"
			});
		};

		vm.onCreate = (values, $event) => {
			$mdDialog.show({
				targetEvent: $event,
				clickOutsideToClose: true,
				bindToController: true,
				controllerAs: "vm",
				templateUrl:
					"/components/storage/movement/movementAdmin/dialogCreate.html",
				controller($scope, $mdDialog, $mdToast) {
					let vm = this;
					vm.movement = values;
					vm.movement.date = moment().format("YYYY-MM-DD");
					vm.units = vmParent.units;
					vm.destinyUnits = vmParent.destinyUnits;
					$scope.$watch('vm.movement.datePurchaseOrder', val => {
						if (val && val.getFullYear) vm.movement.yearPurchaseOrder = val.getFullYear();
					});

					movementTypeFactory
						.getAll()
						.then(res => (vm.movementTypes = res.obj.movementTypes))
						.catch(err =>
							$mdToast.showSimple(
								"Error al obtener tipos de movimiento." +
								(console.error(err) || "")
							)
						);

					companyFactory
						.getAll()
						.then(res => (vm.companies = res.obj.companies))
						.catch(err =>
							$mdToast.showSimple(
								"Error al obtener las compañías" +
								(console.log(err) || "")
							)
						);

					vm.cancel = () => $mdDialog.cancel();
					vm.confirm = () => {
						movementFactory
							.create(vm.movement)
							.then(res => {
								$mdDialog.hide();
								document.location.href =
									"#/bodega/movimientos/" +
									res.obj.movement.id;
							})
							.catch(err =>
								$mdToast.showSimple(
									"Error al crear el movimiento" +
									(console.error(err) || "")
								)
							);
					};
				}
			});
		};

		vm.timeSearch = null;
		$scope.$watch("vm.searchText", searchText => {
			if (vm.timeSearch) clearTimeout(vm.timeSearch);
			vm.timeSearch = setTimeout(() => vm.refreshSearch(), 500);
		});
	}
})();
