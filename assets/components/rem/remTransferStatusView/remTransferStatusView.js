(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-transfer-status-view></ssvq-rem-transfer-status-view>
     */
    app.directive('ssvqRemTransferStatusView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remTransferStatusView/remTransferStatusView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, remTransferStatusFactory) {
        var vm = this;
        vm.page = 1;
        vm.limit = 20;
        vm.searchText = '';
        vm.transferStatus = [];

        vm.get = () => {
            vm.transferStatus = null;
            vm.promise = remTransferStatusFactory.get({
                filter: vm.searchText,
                page: vm.page,
                limit: vm.limit
            })
                .then((response) => {
                    if (response.ok) {
                        vm.transferStatus = response.obj.transferStatus;
                        vm.found = response.obj.found;
                    } else {
                        vm.transferStatus = [];
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        var save = (data) => {
            $mdDialog.hide();
            $mdToast.showSimple($translate.instant('TRANSFERSTATUS.OTHERS.SAVING'));
            remTransferStatusFactory.save(data)
                .then((response) => {
                    $mdToast.showSimple($translate.instant(response.msg));
                    if (response.ok) {
                        vm.get();
                    } else {
                        console.log(response);
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        var deleteStatus = (id) => {
            $mdToast.showSimple($translate.instant('TRANSFERSTATUS.OTHERS.DELETING'));
            remTransferStatusFactory.delete(id)
                .then((response) => {
                    $mdToast.showSimple($translate.instant(response.msg));
                    if (response.ok) {
                        vm.get();
                    } else {
                        console.log(response);
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        vm.showEditDialog = ($event, transferStatus) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: '/components/rem/remTransferStatusView/dialog.save.html',
                controller: function (transferStatus, save) {
                    var vm = this;
                    vm.transferStatus = transferStatus;
                    vm.save = save;
                    vm.cancel = () => {
                        $mdDialog.hide();
                    };
                    vm.msg = '';
                },
                controllerAs: 'vm',
                locals: {
                    transferStatus: angular.copy(transferStatus),
                    save: save
                }
            });
        };

        vm.showDeleteConfirm = (item) => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title($translate.instant('TRANSFERSTATUS.DELETE.TITLE'))
                    .textContent($translate.instant('TRANSFERSTATUS.DELETE.TEXTCONTENT'))
                    .ok($translate.instant('TRANSFERSTATUS.DELETE.OK'))
                    .ariaLabel($translate.instant('TRANSFERSTATUS.DELETE.TITLE'))
                    .cancel($translate.instant('TRANSFERSTATUS.DELETE.CANCEL'))
            ).then(() => {
                deleteStatus(item.id);
            }, (err) => {
                console.log(err);
            });
        };

        $scope.$watch(() => { return vm.searchText; }, (newValue) => {
            vm.page = 1;
            vm.get();
        });

    }
})();