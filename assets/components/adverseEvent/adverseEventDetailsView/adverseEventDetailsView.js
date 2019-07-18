(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-details-view></ssvq-adverse-event-details-view>
     */
    app.directive('ssvqAdverseEventDetailsView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventDetailsView/adverseEventDetailsView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $stateParams, $state, $mdToast, adverseEventFactory, utilitiesFactory, $adverseEventDialog) {
        var vm = this;

        var gender = utilitiesFactory.getGender();
        var typePatient = utilitiesFactory.getTypePatient();
        var relationships = utilitiesFactory.getRelationships();

        var getDetails = () => {
            adverseEventFactory.getDetails($stateParams.id)
                .then(response => {
                    if (response.ok) {
                        vm.event = (response.obj || {}).eventData;
                        vm.form = (response.obj || {}).formData;
                        vm.privileges = (response.obj || {}).privileges;
                        var can = $state.current.data.privileges;
                        vm.canEdit = can['update'];
                        vm.tmpStatus = vm.event.status;
                        vm.withShrink = false;
                    }
                    if (!vm.event.id) {
                        $mdToast.showSimple('No existe evento');
                        window.location.href = '#/eventos-adversos';
                    }
                }, err => {
                    console.log(err);
                    $mdToast.showSimple('Ha ocurrido un error');
                    window.location.href = '#/eventos-adversos';
                });
        };

        vm.getGender = (value) => {
            return (_.find(gender, { value: value }) || {}).name;
        };
        vm.getTypePatient = (value) => {
            return (_.find(typePatient, { value: value }) || {}).name;
        };

        vm.getRelationships = (value) => {
            return (_.find(relationships, { value: value }) || {}).name;
        };
        
        vm.intrahospitalId = adverseEventFactory.getIntrahospitalId();

        vm.goBack = () => window.history.back();
        
        vm.statusChanged = () => {
            vm.changing = true;
            vm.tmpStatus = parseInt(vm.tmpStatus);
            adverseEventFactory
                .saveStatus(vm.event.id, vm.tmpStatus)
                .then(response => {
                    if (response.ok) {
                        $mdToast.showSimple('Se ha cambiado de estado correctamente');
                        vm.event.status = vm.tmpStatus;
                    } else {
                        $mdToast.showSimple('Ha ocurrido un error, intente nuevamente');
                        vm.tmpStatus = vm.event.status;
                    }
                }, err => {
                    console.log(err);
                    $mdToast.showSimple('Ha ocurrido un error, intente nuevamente');
                    vm.tmpStatus = vm.event.status;
                });
        };

        adverseEventFactory
            .getStatus()
            .then(response => {
                if (response.ok) {
                    vm.status = response.obj.status;
                    vm.finalizedStatus = _.map(_.filter(vm.status, {finished: true}), 'id');
                } else {
                    vm.status = [];
                    console.log('Ha ocurrido un error');
                }
            }, err => {
                console.log(err);
            });

        vm.showEditEvent = ($event) => {
            $adverseEventDialog
                .show($event, { event: vm.event, form: vm.form })
                .then(response => {
                    if (response) {
                        vm.event = vm.form = undefined;
                        getDetails();
                    }
                });
        };

        var socketRequest = (event) => {
            if (event && event.data && event.data.data) {
                vm.event.status = vm.tmpStatus = event.data.data.status;
            }
        };

        io.socket.on('adverseevent', socketRequest);
        $scope.$on("$destroy", function () {
            if (vm.event) {
                adverseEventFactory.unsubscribe(vm.event.id);
            }
            io.socket.off('request', socketRequest);
        });

        getDetails();

    }
})();