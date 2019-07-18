(() => {
    'use strict';
    /**
      * Example
      * <ssvq-my-workshift></ssvq-my-workshift>
      */
    app.directive('ssvqMyWorkshift', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/workshift/myWorkshift/myWorkshift.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, workshiftFactory) {
        var vm = this;

        workshiftFactory.getCurrentWorkshift().then(idWorkshift => {

            vm.idWorkshift = idWorkshift;

            // Obtener información básica del turno
            workshiftFactory.getDetails(vm.idWorkshift).then(workshift => {
                vm.workshiftData = workshift;
            });

            // Obtener lista de equipos de trabajo con participantes
            workshiftFactory.getFullCareTeamList(vm.idWorkshift).then(careTeamList => {
                vm.careTeamList = careTeamList;
                $scope.$apply();
            }, err => console.log(err));

            // Obtener lista de comentarios
            workshiftFactory.getTimeline(vm.idWorkshift).then(commentList => {
                vm.commentList = commentList;
                $scope.$apply();
            }, err => console.log(err));

            // Enviar comentario
            vm.sendComment = (comment) => new Promise((resolve, reject) => {
                comment.idModelModule = vm.idWorkshift;
                comment.modelModule = 'workshift';
                workshiftFactory.addComment(comment).then(resolve, reject);
            });

            vm.hasActiveWorkshift = true;

            var onSocketMessage = function (event) {
                if (event.id == vm.idWorkshift) {
                    let { message, data } = event.data;
                    switch (message) {
                        case 'commentCreated':
                            vm.commentList.unshift(data);
                            break;
                    }
                    $scope.$apply();
                }
            };
            io.socket.on('workshift', onSocketMessage);
            $scope.$on('$destroy', () => io.socket.off('workshift', onSocketMessage));
        }, () => {
            vm.hasActiveWorkshift = false;
            $scope.$apply();
        });

        vm.careTeamListOpts = { disabled: true };
    }
})();