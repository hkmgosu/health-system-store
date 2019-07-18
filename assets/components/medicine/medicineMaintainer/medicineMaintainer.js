(() => {
    'use strict';
    /**
     * Example
     * <ssvq-medicine-maintainer></ssvq-medicine-maintainer>
     */
    app.directive('ssvqMedicineMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/medicine/medicineMaintainer/medicineMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, medicineFactory) {
        var vm = this;
        vm.page = 1;
        vm.limit = 20;
        vm.searchText = '';
        vm.medicines = [];
        vm.temp = {};

        vm.get = () => {
            vm.medicines = null;
            vm.promise = medicineFactory.get({
                filter: vm.searchText,
                page: vm.page,
                limit: vm.limit
            })
                .then((response) => {
                    if (response.ok) {
                        vm.medicines = response.obj.medicines;
                        vm.found = response.obj.found;
                    } else {
                        vm.medicines = [];
                    }
                }, (err) => {
                    console.log(err);
                    vm.medicines = [];
                });
        };

        var save = (data) => {
            $mdDialog.hide();
            $mdToast.showSimple($translate.instant('MEDICINE.OTHERS.SAVING'));
            medicineFactory.save(data)
                .then((response) => {
                    $mdToast.showSimple($translate.instant(response.msg));
                    if (response.ok) {
                        vm.get();
                        vm.temp = {};
                    } else {
                        // TODO
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        vm.delete = (id) => {
            $mdToast.showSimple($translate.instant('MEDICINE.OTHERS.DELETING'));
            medicineFactory.delete(id)
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

        vm.showDeleteConfirm = (item) => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title($translate.instant('MEDICINE.DELETE.TITLE'))
                    .textContent($translate.instant('MEDICINE.DELETE.TEXTCONTENT'))
                    .ok($translate.instant('MEDICINE.DELETE.OK'))
                    .ariaLabel($translate.instant('MEDICINE.DELETE.TITLE'))
                    .cancel($translate.instant('MEDICINE.DELETE.CANCEL'))
            ).then(() => {
                vm.delete(item.id);
            }, () => {
                debugger;
            });
        };

        vm.showSaveDialog = ($event, medicine) => {
            $mdDialog.show({
                targetEvent: $event || null,
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: '/components/medicine/medicineMaintainer/dialog.save.tmpl.html',
                /* @ngInject */
                controller: function DialogController($mdDialog, temp, save, categoryMedicines, subCategoryMedicines, drugCategories) {
                    var vm = this;
                    vm.temp = temp;
                    vm.categoryMedicines = categoryMedicines;
                    vm.subCategoryMedicines = subCategoryMedicines;
                    vm.drugCategories = drugCategories;
                    vm.save = save;
                    vm.cancel = () => {
                        $mdDialog.hide();
                    };
                    vm.msg = '';
                },
                controllerAs: 'vm',
                locals: {
                    temp: angular.copy(medicine),
                    save: save,
                    categoryMedicines: vm.categoryMedicines,
                    subCategoryMedicines: vm.subCategoryMedicines,
                    drugCategories: vm.drugCategories
                }
            });
        };

        (() => {
            medicineFactory
                .getAllCategoryMedicines()
                .then(data => {
                    vm.categoryMedicines = data.categoryMedicines;
                })
                .catch(err => {
                    console.log(err);
                });
        })();

        (() => {
            medicineFactory
                .getAllSubCategoryMedicines()
                .then(data => {
                    vm.subCategoryMedicines = data.subCategoryMedicines;
                })
                .catch(err => {
                    console.log(err);
                });
        })();

        (() => {
            medicineFactory
                .getAllDrugCategories()
                .then(data => {
                    vm.drugCategories = data.drugCategories;
                })
                .catch(err => {
                    console.log(err);
                });
        })();

        $scope.$watch(() => { return vm.searchText; }, (newValue) => {
            vm.page = 1;
            vm.get();
        });

    }
})();