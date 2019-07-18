(function () {
    'use strict';
    /**
     * Example
     * <ssvq-establishment-type-maintainer></ssvq-establishment-type-maintainer>
     */
    app.directive('ssvqEstablishmentTypeMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/establishment/establishmentTypeMaintainer/establishmentTypeMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, establishmentTypeFactory) {
        var vm = this;
        angular.extend($scope, {
            limit: 20,
            page: 1,
            searchText: '',
            get: function () {
                $scope.establishmentTypes = null;
                $scope.promise = establishmentTypeFactory.get({
                    filter: $scope.searchText,
                    limit: $scope.limit,
                    page: $scope.page
                })
                    .then(function (response) {
                        if (response.ok) {
                            $scope.establishmentTypes = response.obj.establishmentTypes;
                            $scope.found = response.obj.found;
                        } else {
                            $scope.establishmentTypes = [];
                        }
                    }, function (err) {
                        debugger;
                    });
            },
            uploadIcon: function (id, file) {
                establishmentTypeFactory.uploadIcon(id, file)
                    .then(function (response) {
                        if (response.data.ok) {
                            $scope.get();
                        } else {
                            // TODO
                        }
                    }, function (err) {
                        debugger;
                    });
            },
            save: function (data) {
                $mdDialog.hide();
                $mdToast.showSimple($translate.instant('ESTABLISHMENTTYPE.OTHERS.SAVING'));
                establishmentTypeFactory.save(data)
                    .then(function (response) {
                        $mdToast.showSimple($translate.instant(response.msg));
                        if (response.ok) {
                            if ($scope.file) {
                                $scope.uploadIcon(response.obj.establishmentType.id, $scope.file[0]);
                            } else {
                                $scope.get();
                            }
                        } else {
                            // TODO
                        }
                    }, function (err) {
                        debugger;
                    });
            },
            showSaveDialog: function (establishmentType) {
                $scope.temp = angular.copy(establishmentType);
                $mdDialog.show({
                    clickOutsideToClose: true,
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: '/components/establishment/establishmentTypeMaintainer/dialog.save.tmpl.html',
                    controller: function DialogController($scope, $mdDialog) {
                        $scope.cancel = function () {
                            $mdDialog.hide();
                        };
                        $scope.msg = '';
                    }
                })
                    .finally(function () {
                        $scope.file = undefined;
                    });
            },
            delete: function (id) {
                $mdToast.showSimple($translate.instant('ESTABLISHMENTTYPE.OTHERS.DELETING'));
                establishmentTypeFactory.delete(id)
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
                        .title($translate.instant('ESTABLISHMENTTYPE.DELETE.TITLE'))
                        .textContent($translate.instant('ESTABLISHMENTTYPE.DELETE.TEXTCONTENT'))
                        .ok($translate.instant('ESTABLISHMENTTYPE.DELETE.OK'))
                        .ariaLabel($translate.instant('ESTABLISHMENTTYPE.DELETE.TITLE'))
                        .cancel($translate.instant('ESTABLISHMENTTYPE.DELETE.CANCEL'))
                ).then(function () {
                    $scope.delete(item.id);
                }, function () {
                    debugger;
                });
            }
        });

        $scope.$watch('searchText', function (searchText) {
            $scope.page = 1;
            $scope.get();
        });
    }
})();