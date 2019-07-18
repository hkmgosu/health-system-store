(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-stakeholder-list stakeholders=""></ssvq-request-stakeholder-list>
     */
    app.directive('ssvqRequestStakeholderList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                request: '=',
                stakeholders: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestStakeholderList/requestStakeholderList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, requestStakeholdersFactory) {
        var vm = this;

        vm.fields = {
            fullname: true
        };

        vm.rmStakeholder = function (stakeholder) {
            requestStakeholdersFactory
                .rmStakeholder(stakeholder)
                .then(function (res) {
                    if (res.ok) {
                        _.remove(vm.stakeholders, { id: stakeholder.id });
                        $mdToast.showSimple('Se quitó el funcionario como participante de la solicitud');
                    }
                }, function (err) {
                    console.log('Error quitando participante de solicitud', err);
                });
        };

        vm.addStakeholder = function (employeeSelected) {
            let coincidence = _.find(vm.stakeholders, function (stakeholder) {
                return stakeholder.employee.id === employeeSelected.id;
            });
            if (coincidence) {
                return $mdToast.showSimple('Participante ya se encuentra en la lista');
            }
            let tmpStakeholder = {
                request: vm.request,
                employee: _.pick(employeeSelected, ['id', 'fullname'])
            };
            requestStakeholdersFactory
                .addStakeholder(tmpStakeholder)
                .then(function (res) {
                    if (res.ok) {
                        if (!_.find(vm.stakeholders, { id: res.obj.id })) {
                            vm.stakeholders.push(_.extend(res.obj, tmpStakeholder));
                        }
                        $mdToast.showSimple('Se agregó el funcionario como participante de la solicitud');
                    }
                }, function (err) {
                    $mdToast.showSimple('Ha ocurrido un error agregando al participante de la solicitud');
                });
        };
    }
})();