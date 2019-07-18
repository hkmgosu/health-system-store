(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-details-view></ssvq-request-details-view>
     */
    app.directive('ssvqRequestDetailsView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestDetailsView/requestDetailsView.html'
        };
    });

    /* @ngInject */
    function ComponentController($rootScope, $scope, $mdToast, $stateParams, $location, requestFactory) {
        var vm = this;
        var localState = {};
        vm.idRequest = $stateParams.id;
        vm.request = $stateParams.request;
        vm.stateChanged = function () {
            if (localState.id != vm.request.state.id) {
                requestFactory
                    .setState(vm.request.id, vm.request.state)
                    .then(function (response) {
                        if (response.ok) {
                            localState = vm.request.state;
                            console.log('State - Success Update');
                        } else {
                            console.log('State - Fail Update');
                        }
                    }, function (err) {
                        console.log('State - Fail Update' + err);
                    });
            }
        };
        /**
         * Obtener states de requests
         */
        requestFactory
            .getStates()
            .then(function (response) {
                if (response.ok) {
                    vm.states = response.obj;
                    console.log('States - Success Get');
                } else {
                    console.log('States - Error Get');
                }
            }, function (err) {
                console.log('States - Error Get');
            });

        requestFactory
            .getDetails($stateParams.id)
            .then(function (response) {
                if (response.ok) {
                    vm.userTypes = response.userTypes;
                    vm.request = response.obj;
                    vm.request.tagsCollection = vm.request.tags ? vm.request.tags.split('#') : [];
                    localState = response.obj.state;
                    vm.permissionDenied = false;
                    console.log('Solicitudes obtenidas correctamente');
                } else {
                    vm.permissionDenied = true;
                    console.log('Error obteniendo solicitudes');
                }
            }, function (err) {
                console.log('Error obteniendo solicitudes' + err);
            });

        vm.goBack = function () {
            window.history.back();
        };

        var socketRequest = function (event) {
            if (event.id === vm.request.id) {
                switch (event.data.message) {
                    case 'request:new-state':
                        localState = vm.request.state = event.data.data.state;
                        break;
                    default:
                        console.warn('Unrecognized socket event (`%s`) from server:', event.verb, event);
                }
            }
        };
        io.socket.on('request', socketRequest);
        $scope.$on("$destroy", function () {
            if (vm.request) {
                requestFactory.unsubscribe(vm.request.id)
            }
            io.socket.off('request', socketRequest);
        });

        vm.sendComment = (comment) => new Promise((resolve, reject) => {
            comment.idModelModule = vm.idRequest;
            comment.modelModule = 'request';
            let mentionedList = $('<div>' + comment.description + '</div>').find('ssvq-employee-profile-link').toArray().map(node => $(node).attr('id-employee'));
            requestFactory.addComment(comment, mentionedList || []).then(resolve, reject);
        });
    }
})();