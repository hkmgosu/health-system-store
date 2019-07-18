(function () {
    'use strict';
    /**
     * Example
     * <ssvq-typecasting-details></ssvq-typecasting-details>
     */
    app.directive('ssvqTypecastingDetails', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { selected: '=', mode: '@' },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/typecasting/typecastingDetails/typecastingDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, employeeFactory, $timeout, $mdDialog) {
        var vm = this;
        vm.getParseDate = function (data) {
            if (data) {
                data = ('000000' + data.toString()).slice(-6);
                return data.substring(0, 2) + ' años ' + data.substring(2, 4) + ' meses ' + data.substring(4, 6) + ' días';
            } else {
                return '';
            }
        };
        vm.export = function () {
            $timeout(function () {
                window.print();
            });
        };
        vm.showPriorityInfo = function ($event) {
            $mdDialog.show({
                targetEvent: $event,
                template:
                    '<md-dialog aria-label="Información prioridad" flex="90" flex-gt-sm="60">' +
                    '  <md-dialog-content class="md-padding">' +
                    '    <ssvq-typecasting-priority-info></ssvq-typecasting-priority-info>' +
                    '  </md-dialog-content>' +
                    '  <md-dialog-actions>' +
                    '    <md-button ng-click="vm.closeDialog()" class="md-primary">' +
                    '      Aceptar' +
                    '    </md-button>' +
                    '  </md-dialog-actions>' +
                    '</md-dialog>',
                controller: function () {
                    var vm = this;
                    vm.closeDialog = closeDialog;
                },
                controllerAs: 'vm',
                bindToController: true
            });
        };
        vm.showScoreInfo = function ($event) {
            $mdDialog.show({
                targetEvent: $event,
                template:
                    '<md-dialog aria-label="Información puntuación" flex="90" flex-gt-sm="60">' +
                    '  <md-dialog-content class="md-padding">' +
                    '    <ssvq-typecasting-score-info></ssvq-typecasting-score-info>' +
                    '  </md-dialog-content>' +
                    '  <md-dialog-actions>' +
                    '    <md-button ng-click="vm.closeDialog()" class="md-primary">' +
                    '      Aceptar' +
                    '    </md-button>' +
                    '  </md-dialog-actions>' +
                    '</md-dialog>',
                controller: function () {
                    var vm = this;
                    vm.closeDialog = closeDialog;
                },
                controllerAs: 'vm',
                bindToController: true
            });
        };
        vm.showHistoryInfo = function ($event) {
            $mdDialog.show({
                targetEvent: $event,
                template:
                    '<md-dialog aria-label="Información Antigüedades" flex="90" flex-gt-sm="60">' +
                    '  <md-dialog-content class="md-padding">' +
                    '    <ssvq-typecasting-history-info></ssvq-typecasting-history-info>' +
                    '  </md-dialog-content>' +
                    '  <md-dialog-actions>' +
                    '    <md-button ng-click="vm.closeDialog()" class="md-primary">' +
                    '      Aceptar' +
                    '    </md-button>' +
                    '  </md-dialog-actions>' +
                    '</md-dialog>',
                controller: function () {
                    var vm = this;
                    vm.closeDialog = closeDialog;
                },
                controllerAs: 'vm',
                bindToController: true
            });
        };

        var closeDialog = function () {
            $mdDialog.hide();
        };

        $scope.$watch(() => { return vm.selected; }, function (newValue) {
            if (newValue) {
                vm.employee = newValue;
                vm.promise = employeeFactory.getTypecasting(newValue.id).then((data) => {
                    if (data.ok) {
                        vm.employee = data.obj.employee;
                        vm.typecasting = _.orderBy(data.obj.typecasting, 'year');
                    }
                });
            }
        });

        if (vm.mode === 'me') {
            vm.employee = employee;
            vm.promise = employeeFactory.getMyTypecasting().then((data) => {
                if (data.ok) {
                    vm.employee = data.obj.employee;
                    vm.typecasting = _.orderBy(data.obj.typecasting, 'year');
                }
            });
        }
    }
})();
