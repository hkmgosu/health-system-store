(function () {
    'use strict';
    /**
     * Example
     * <ssvq-profile-maintainer></ssvq-profile-maintainer>
     */
    app.directive('ssvqProfileMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/profile/profileMaintainer/profileMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $q, profileFactory) {
        var vm = this;
        $scope.found = 0;
        $scope.query = {
            order: 'name',
            limit: 20,
            page: 1
        };
        vm.searchText = '';

        vm.getList = () => {
            profileFactory.getList(vm.searchText).then(profileList => {
                vm.profileList = profileList;
                $scope.$apply();
            });
        };

        vm.showCreateDialog = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/profile/profileMaintainer/dialog.create.tmpl.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.profile);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then(profile => {
                $mdToast.showSimple('Creando perfil...');
                profileFactory.create(profile).then(profileCreated => {
                    window.location.href = '#/perfiles/detalles/' + profileCreated.id
                }, err => {
                    console.log(err);
                    $mdToast.showSimple('Ha ocurrido un error creando el perfil');
                });
            });
        };

        $scope.$watch('vm.searchText', () => {
            $scope.query.page = 1;
            vm.getList();
        });

        vm.onDelete = idProfile => _.remove(vm.profileList, { id: idProfile });
    }
})();