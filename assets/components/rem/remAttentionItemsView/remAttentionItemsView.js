(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-attention-items-view></ssvq-rem-attention-items-view>
     */
    app.directive('ssvqRemAttentionItemsView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remAttentionItemsView/remAttentionItemsView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, remAttentionFactory) {
        var vm = this;
        vm.page = 1;
        vm.limit = 20;
        vm.searchText = '';
        vm.attentionItems = [];
        vm.attentionClasses = [];

        vm.get = () => {
            vm.attentionItems = null;
            vm.promise = remAttentionFactory.getItems({
                filter: vm.searchText,
                page: vm.page,
                limit: vm.limit
            })
                .then((response) => {
                    if (response.ok) {
                        vm.attentionItems = response.obj.attentionItems;
                        vm.attentionItems = _.map(vm.attentionItems, (item) => {
                            item.classView = _.find(vm.attentionClasses, { id: item.class });
                            return item;
                        });
                        vm.found = response.obj.found;
                    } else {
                        vm.attentionItems = [];
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        var save = (data) => {
            $mdDialog.hide();
            $mdToast.showSimple($translate.instant('ATTENTIONITEM.OTHERS.SAVING'));
            remAttentionFactory.saveItem(data)
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

        var deleteItem = (id) => {
            $mdToast.showSimple($translate.instant('ATTENTIONITEM.OTHERS.DELETING'));
            remAttentionFactory.deleteItem(id)
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

        vm.showEditDialog = ($event, attentionItem) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: '/components/rem/remAttentionItemsView/dialog.save.html',
                controller: function (attentionItem, attentionClasses, save) {
                    var vm = this;
                    vm.attentionItem = attentionItem;
                    vm.attentionClasses = attentionClasses;
                    vm.save = save;
                    vm.cancel = () => {
                        $mdDialog.hide();
                    };
                    vm.msg = '';
                },
                controllerAs: 'vm',
                locals: {
                    attentionItem: angular.copy(attentionItem),
                    attentionClasses: vm.attentionClasses,
                    save: save
                }
            });
        };

        vm.showDeleteConfirm = (item) => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title($translate.instant('ATTENTIONITEM.DELETE.TITLE'))
                    .textContent($translate.instant('ATTENTIONITEM.DELETE.TEXTCONTENT'))
                    .ok($translate.instant('ATTENTIONITEM.DELETE.OK'))
                    .ariaLabel($translate.instant('ATTENTIONITEM.DELETE.TITLE'))
                    .cancel($translate.instant('ATTENTIONITEM.DELETE.CANCEL'))
            ).then(() => {
                deleteItem(item.id);
            }, (err) => {
                console.log(err);
            });
        };

        var getAllClasses = () => {
            vm.promise = remAttentionFactory.getAllClasses()
                .then((response) => {
                    if (response.ok) {
                        vm.attentionClasses = response.obj.attentionClasses;
                    } else {
                        vm.attentionClasses = [];
                    }
                }, (err) => {
                    console.log(err);
                    vm.attentionClasses = [];
                });
        };

        getAllClasses();
        $scope.$watch(() => { return vm.searchText; }, (newValue) => {
            vm.page = 1;
            vm.get();
        });

    }
})();