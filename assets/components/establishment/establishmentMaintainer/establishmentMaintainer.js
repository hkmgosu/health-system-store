(function () {
    'use strict';
    /**
     * Example
     * <ssvq-establishment-maintainer></ssvq-establishment-maintainer>
     */
    app.directive('ssvqEstablishmentMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/establishment/establishmentMaintainer/establishmentMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, establishmentFactory, establishmentTypeFactory) {
        var vm = this;
        angular.extend($scope, {
            limit: 20,
            page: 1,
            searchText: '',
            get: function () {
                $scope.establishments = null;
                $scope.promise = establishmentFactory.get({
                    name: { contains: $scope.searchText }
                }, { page: $scope.page, limit: $scope.limit }, { getTotal: true }).then(response => {
                    $scope.establishments = response.list;
                    $scope.found = response.total;
                }, () => {
                    $scope.establishments = [];
                    $scope.found = 0;
                });
            },
            getTypes: function () {
                establishmentTypeFactory.getAll({})
                    .then(function (response) {
                        if (response.ok) {
                            $scope.types = response.obj;
                        } else {
                            $scope.types = [];
                        }
                    }, function (err) {
                        debugger;
                    });
            },
            showSaveDialog: (establishment) => {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl: '/components/establishment/establishmentMaintainer/dialog.save.tmpl.html',
                    controller: function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.save = () => $mdDialog.hide(vm.establishment);
                    },
                    controllerAs: 'vm',
                    bindToController: true,
                    locals: { establishment: angular.copy(establishment), types: $scope.types }
                }).then(establishmentUpdated => {
                    $mdToast.showSimple($translate.instant('ESTABLISHMENT.OTHERS.SAVING'));
                    establishmentFactory.save(establishmentUpdated).then(
                        response => {
                            $mdToast.showSimple($translate.instant(response.msg));
                            if (response.ok) { $scope.get(); }
                        }, err => console.log(err)
                    );
                });
            },
            delete: function (id) {
                $mdToast.showSimple($translate.instant('ESTABLISHMENT.OTHERS.DELETING'));
                establishmentFactory.delete(id)
                    .then(function (response) {
                        $mdToast.showSimple($translate.instant(response.msg));
                        if (response.ok) {
                            $scope.get();
                        } else {
                            // TODO
                        }
                    }, function () {
                        debugger;
                    });
            },
            showDeleteConfirm: function (item) {
                $mdDialog.show(
                    $mdDialog.confirm()
                        .title($translate.instant('ESTABLISHMENT.DELETE.TITLE'))
                        .textContent($translate.instant('ESTABLISHMENT.DELETE.TEXTCONTENT'))
                        .ok($translate.instant('ESTABLISHMENT.DELETE.OK'))
                        .ariaLabel($translate.instant('ESTABLISHMENT.DELETE.TITLE'))
                        .cancel($translate.instant('ESTABLISHMENT.DELETE.CANCEL'))
                ).then(function () {
                    $scope.delete(item.id);
                }, function () {
                    debugger;
                });
            }
        });

        $scope.getTypes();

        $scope.$watch('searchText', function (searchText) {
            $scope.page = 1;
            $scope.get();
        });

        $scope.getTypeObj = function (id) {
            return _.find($scope.types, { id: id }) || {};
        };
    }
})();