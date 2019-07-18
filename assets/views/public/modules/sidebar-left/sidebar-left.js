(function () {
    'use strict';
    /**
     * Example
     * <ssvq-public-sidebar></ssvq-public-sidebar>
     */
    app.directive('ssvqPublicSidebar', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: true,
            restrict: 'E',
            scope: {},
            templateUrl: '/views/public/modules/sidebar-left/sidebar-left.tmpl.html'
        };
    });

    /* @ngInject */
    function ComponentController($rootScope, $scope, $mdToast, $mdDialog, $mdSidenav, establishmentTypeFactory, establishmentFactory, triLayout) {
        var vm = this;

        let establishmentList = [];

        async.parallel({
            establishmentTypeList: establishmentTypeFactory.getAllPublic,
            establishmentList: establishmentFactory.getAllPublic
        }, (err, results) => {
            if (err) { return console.log(err); }
            vm.establishmentTypeList = results.establishmentTypeList.map(establishmentType => {
                establishmentType.visible = true;
                return establishmentType;
            });
            vm.establishmentList = results.establishmentList;
            establishmentList = angular.copy(results.establishmentList);
            $rootScope.$broadcast('establishments/get', {
                establishmentList: vm.establishmentList
            });
            watchSearchText();
        });

        vm.searchTextEstablishments = '';
        var watchSearchText = function () {
            $scope.$watch(function () { return vm.searchTextEstablishments; }, function (value) {
                applyFilter();
            });
        };

        var applyFilter = () => {
            let filter = vm.searchTextEstablishments.toLowerCase();
            let tmpEstablishmentList = [];
            establishmentList.forEach(establishment => {
                // Validar que el tipo de establecimiento no esté oculto
                if (!(_.find(vm.establishmentTypeList, { id: establishment.type }) || {}).visible) {
                    return;
                }
                // Validar que concuerde con texto de búsqueda
                if (establishment.name.toLowerCase().indexOf(filter) != -1) {
                    tmpEstablishmentList.push(establishment);
                }
            });
            vm.establishmentList = tmpEstablishmentList;
            $rootScope.$broadcast('establishments/get', {
                establishmentList: vm.establishmentList
            });
        };

        vm.toggleIconMenu = function toggleIconMenu() {
            var menu = vm.layout.sideMenuSize === 'icon' ? 'full' : 'icon';
            triLayout.setOption('sideMenuSize', menu);
        };

        vm.viewDetails = function (item) {
            if (item.address) {
                $rootScope.$broadcast('establishment/focus', item);
            }
            $mdSidenav('left').close();
        };

        vm.toggleTypeVisibility = function (type) {
            type.visible = !type.visible;
            applyFilter();
        };
    }
})();
