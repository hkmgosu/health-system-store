(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-list-view mode="received|sent|management">
     * </ssvq-request-list-view>
     */
    app.directive('ssvqRequestListView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                mode: '@' // received|sent|management
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestListView/requestListView.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdSidenav, $mdDialog, $mdToast, localStorageService, $state, requestFactory) {
        var vm = this;
        vm.toggleFilter = () => {
            $mdSidenav('request-filter').toggle();
        };
        requestFactory
            .canAutoassign()
            .then(function (response) {
                if (response.ok) {
                    vm.canSelfAssign = true;
                } else {
                    vm.canSelfAssign = false;
                }
            }, function (err) {
                console.log(err);
            });
        vm.showNewRequest = ($event, opts) => {
            opts = opts || {};
            $mdDialog.show({
                targetEvent: $event || null,
                clickOutsideToClose: true,
                templateUrl: '/components/request/requestListView/dialog.newRequest.html',
                /* @ngInject */
                controller: function ($scope, $mdDialog, requestFactory) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.save = request => {
                        if (vm.saveForm.autocompleteForm) {
                            vm.saveForm.autocompleteForm.unitAutocomplete.$setTouched();
                        }
                        if (vm.saveForm.$valid) {
                            $mdDialog.hide(request);
                        }
                    };

                    var pasteEvent = (e) => {
                        if (e.clipboardData) {
                            var items = e.clipboardData.items;
                            if (!items) return;

                            //access data directly
                            for (var i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf("image") !== -1) {
                                    //image
                                    var blob = items[i].getAsFile();
                                    vm.uploadFiles([blob]);
                                }
                            }
                        }
                    };

                    $('body').on('focus', 'textarea#description-input', () => document.addEventListener('paste', pasteEvent));
                    $('body').on('focusout', 'textarea#description-input', () => document.removeEventListener('paste', pasteEvent));

                    $scope.$on("$destroy", function () {
                        document.removeEventListener('paste', pasteEvent);
                    });

                    $scope.$watch('vm.request.files',
                        newVal => vm.inProgress = !_.every(newVal, 'id'),
                        true
                    );

                    vm.request = localStorageService.get('tmplRequest') || {};

                    $scope.$watch('vm.request', request => {
                        localStorageService.set('tmplRequest', request);
                    }, true);

                    /**
                     * Obtener labels de requests
                     */
                    requestFactory.getLabels().then(
                        labels => vm.labels = labels || [],
                        err => vm.labels = []
                    );

                    vm.querySearch = requestFactory.getPopularTags;
                    vm.transformChip = chip => {
                        if (angular.isObject(chip)) {
                            return chip;
                        }
                        return { name: chip };
                    };
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    selfAssigned: opts.selfAssigned
                }
            }).then(request => {
                if (request) {
                    request.attachments = _.map(request.files, 'id');
                    request.tags = _.map(request.tagsCollection, 'name').join('#');
                    let data = _.pick(request, [
                        'title',
                        'description',
                        'attachments',
                        'unitAssigned',
                        'tags',
                        'label',
                        'dueDate']);
                    $mdToast.showSimple('Enviando solicitud');
                    requestFactory.create(data, opts.selfAssigned)
                        .then(function (response) {
                            $mdToast.showSimple('Solicitud enviada exitosamente');
                            localStorageService.set('tmplRequest');
                            if (response.ok) {
                                $state.go('triangular.mi-ssvq.admin-request-details', {
                                    id: response.obj.request.id,
                                    request: _.omit(data, 'attachments')
                                });
                            } else {
                                $mdToast.showSimple('Hubo un error enviando solicitud');
                                console.log(response.msg);
                            }
                        }, function (err) {
                            $mdToast.showSimple('Hubo un error enviando solicitud');
                            console.log(err);
                        });
                }
            });
        };
    }
})();