(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-attention-classes-view></ssvq-rem-attention-classes-view>
     */
    app.directive('ssvqRemAttentionClassesView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remAttentionClassesView/remAttentionClassesView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, remAttentionFactory) {
        var vm = this;
        vm.page = 1;
        vm.limit = 20;
        vm.searchText = '';

        vm.get = () => {
            vm.attentionClasses = null;
            vm.promise = remAttentionFactory.getClasses({
                filter: vm.searchText,
                page: vm.page,
                limit: vm.limit
            })
                .then((response) => {
                    if (response.ok) {
                        vm.attentionClasses = response.obj.attentionClasses;
                        vm.found = response.obj.found;
                    } else {
                        vm.attentionClasses = [];
                    }
                }, (err) => {
                    debugger;
                });
        };

        var save = (data) => {
            $mdDialog.hide();
            $mdToast.showSimple($translate.instant('ATTENTIONCLASS.OTHERS.SAVING'));
            remAttentionFactory.saveClass(data)
                .then((response) => {
                    $mdToast.showSimple($translate.instant(response.msg));
                    if (response.ok) {
                        vm.get();
                        vm.temp = {};
                    } else {
                        console.log(response);
                    }
                }, (err) => {
                    debugger;
                });
        };

        var deleteClass = (id) => {
            $mdToast.showSimple($translate.instant('ATTENTIONCLASS.OTHERS.DELETING'));
            remAttentionFactory.deleteClass(id)
                .then((response) => {
                    $mdToast.showSimple($translate.instant(response.msg));
                    if (response.ok) {
                        vm.get();
                    } else {
                        // TODO
                    }
                }, () => {
                    debugger;
                });
        };

        vm.showEditDialog = ($event, attentionClass) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: '/components/rem/remAttentionClassesView/dialog.save.html',
                controller: function (attentionClass, save) {
                    var vm = this;
                    vm.attentionClass = attentionClass;
                    vm.cancel = () => {
                        $mdDialog.hide();
                    };
                    vm.save = save;
                    vm.msg = '';
                },
                controllerAs: 'vm',
                locals: {
                    attentionClass: angular.copy(attentionClass),
                    save: save
                }
            });
        };

        vm.showDeleteConfirm = (item) => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title($translate.instant('ATTENTIONCLASS.DELETE.TITLE'))
                    .textContent($translate.instant('ATTENTIONCLASS.DELETE.TEXTCONTENT'))
                    .ok($translate.instant('ATTENTIONCLASS.DELETE.OK'))
                    .ariaLabel($translate.instant('ATTENTIONCLASS.DELETE.TITLE'))
                    .cancel($translate.instant('ATTENTIONCLASS.DELETE.CANCEL'))
            ).then(() => {
                deleteClass(item.id);
            }, () => {
                debugger;
            });
        };

        $scope.$watch(() => { return vm.searchText; }, (newValue) => {
            vm.page = 1;
            vm.get();
        });

    }
})();