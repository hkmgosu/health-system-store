(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-duplicate-card data=""></ssvq-adverse-event-duplicate-card>
     */
    app.directive('ssvqAdverseEventDuplicateCard', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '=',
                originalId: '@',
                optionButtons: '@',
                cleanList: '&',
                selectBorder: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventDuplicatesView/adverseEventDuplicateCard/adverseEventDuplicateCard.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, adverseEventFactory) {
        var vm = this;
        var idRegisterDuplicate = vm.data.idRegisterDuplicate;
        vm.optionButtons = vm.optionButtons === 'true';
        vm.selectBorder = vm.selectBorder === 'true';


        vm.markNotDuplicateEvent = adverseEventId => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('¿Deseas confirmar que el evento NO ES DUPLICADO?')
                    .textContent('evento #' + adverseEventId + ' no es duplicado de evento #' + vm.originalId)
                    .ok('Si')
                    .cancel('Volver')
            ).then(() => {
                adverseEventFactory
                    .markNotDuplicateEvent(idRegisterDuplicate, adverseEventId)
                    .then(() => {
                        vm.cleanList()(adverseEventId);
                        $mdToast.showSimple($translate.instant('ADVERSEEVENT.DUPLICATEEVENT.SUCCESSNOTDUPLICATE'));
                    })
                    .catch(err => {
                        console.log(err);
                        $mdToast.showSimple($translate.instant('ADVERSEEVENT.DUPLICATEEVENT.ERROR'));
                    });
            });
        };

        vm.markDuplicateEvent = adverseEventId => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('¿Deseas confirmar que el evento ES DUPLICADO?')
                    .textContent('evento #' + adverseEventId + ' es duplicado de evento #' + vm.originalId)
                    .ok('Si')
                    .ariaLabel('no se')
                    .cancel('Volver')
            ).then(() => {
                adverseEventFactory
                    .markDuplicateEvent(idRegisterDuplicate, adverseEventId)
                    .then(() => {
                        vm.cleanList()(adverseEventId, true);
                        $mdToast.showSimple($translate.instant('ADVERSEEVENT.DUPLICATEEVENT.SUCCESSDUPLICATE'));
                        //getEvents(true);
                    })
                    .catch(err => {
                        console.log(err);
                        $mdToast.showSimple($translate.instant('ADVERSEEVENT.DUPLICATEEVENT.ERROR'));
                    });
            });
        };

        vm.getColor = category => {
            switch (category) {
                case 'Incidente sin daño':
                    return '#93c47d';
                case 'Evento adverso':
                    return '#ffd966';
                case 'Evento centinela':
                    return '#ea9999';
                default:
                    return '#ccc';
            }
        };
    }
})();