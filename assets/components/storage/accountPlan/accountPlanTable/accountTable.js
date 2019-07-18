(() => {
	'use strict';
	/**
	* Example
	* <ssvq-storage-account-table></ssvq-storage-account-table>
	*/
	app.directive('ssvqStorageAccountTable', function () {
		return {
			controller: ComponentController,
			controllerAs: 'vm',
			bindToController: {},
			restrict: 'E',
			templateUrl: '/components/storage/accountPlan/accountPlanTable/accountTable.html'
		};
	});

	/* @ngInject */
	function ComponentController($scope, $mdDialog, $mdToast, accountFactory) {
		var vm = this;
		window._scope = $scope;
		angular.extend($scope, {
			viewMode: 'list',
			page: 1,
			limit: 15,
			searchText: '',

			reload: () => {
				$scope.found = null;
				$scope.accounts = null;
				$scope.promise = accountFactory.getAll({
					filter: $scope.searchText,
					limit: $scope.limit,
					page: $scope.page
				}).then(
					// success
					response => {
						if (response.ok) {
							$scope.found = response.obj.found;
							$scope.accounts = response.obj.accounts;
						} else {
							$scope.accounts = [];
						}
					},
					// fail
					err => { debugger; }
				);
			}, //reload

			onCreate($event) {
				let $scopeParent = $scope;
				$mdDialog.show({
					targetEvent: $event,
					clickOutsideToClose: true,
					templateUrl: '/components/storage/accountPlan/accountPlanActions/dialogSave.html',

					controller($scope, $mdDialog) {
						$scope.accountPlan = { year: (new Date).getFullYear() };
						$scope.cancel = () => $mdDialog.cancel();
						$scope.confirm = () => $mdDialog.hide($scope.accountPlan);
					}, //controller

					bindToController: true,
					controllerAs: 'vm'
				}).then(accountPlan => {
					if (_.isEmpty(accountPlan)) { return; }
					$mdToast.showSimple('Creando cuenta...');

					accountFactory.create(accountPlan).then(
						// success
						accountCreated => {
							$mdToast.showSimple('Se ha creado la cuenta.');
							if ($scopeParent.reload) $scopeParent.reload();
						},
						// fail
						err => {
							$mdToast.showSimple('No se pudo crear la cuenta.')
						}
					);
				});
			} //onCreate
		}); // angular.extend

		$scope.$watch('searchText', searchText => {
            $scope.page = 1;
            $scope.reload();
		});
	}
})();