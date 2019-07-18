(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-duplicate-view></ssvq-adverse-event-duplicate-view>
     */
    app.directive('ssvqAdverseEventDuplicatesView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {

            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventDuplicatesView/adverseEventDuplicatesView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $translate, adverseEventFactory) {
        var vm = this;
        vm.loading = false;
        vm.loadingDetail = false;
        vm.duplicateEvents = [];

        var getEvents = () => {
            vm.loading = true;
            adverseEventFactory.getDuplicatedEvents()
                .then(response => {
                    _.forEach(response, duplicate => {
                        if (duplicate.duplicated) {
                            if (_.some(vm.duplicateEvents, { idOrigin: (duplicate.origin || {}).id })) {
                                let temp = _.find(vm.duplicateEvents, { idOrigin: (duplicate.origin || {}).id });
                                temp.duplicated.push(duplicate.duplicated);
                            } else {
                                vm.duplicateEvents.push({
                                    id: duplicate.id,
                                    idOrigin: duplicate.origin.id,
                                    createdAt: duplicate.createdAt,
                                    origin: duplicate.origin,
                                    duplicated: [duplicate.duplicated]
                                });
                            }
                        }
                    });
                    vm.duplicateEvents = _.groupBy(vm.duplicateEvents, event => {
                        return moment(event.createdAt).format('LL');
                    });
                    vm.duplicateEventsLength = Object.keys(vm.duplicateEvents).length;
                    vm.loading = false;
                }, (err) => {
                    vm.duplicateEvents = {};
                    vm.duplicateEventsLength = 0;
                    vm.loading = false;
                    console.log('Error obteniendo eventos' + err)
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

        vm.loadDuplicate = (duplicated) => {
            if (duplicated.id === vm.select) return;
            vm.loadingDetail = true;
            vm.select = duplicated.id;
            vm.detailsDuplicated = duplicated;
            adverseEventFactory.getDuplicatedEvents(duplicated.origin.id)
                .then(result => {
                    if (result.length === 0) {
                        vm.detailsDuplicated = undefined;
                        vm.select = undefined;
                        $mdToast.showSimple('No existen o ya se han resuelto los posibles duplicados');
                    } else {
                        vm.detailsDuplicated.duplicated = _.map(result, duplicatedRegister => {
                            let tempDuplicate = duplicatedRegister.duplicated;
                            tempDuplicate.idRegisterDuplicate = duplicatedRegister.id;
                            return tempDuplicate;
                        });
                    }
                    vm.loadingDetail = false;
                }, err => {
                    console.log(err);
                    vm.detailsDuplicated = undefined;
                    vm.select = undefined;
                    vm.loadingDetail = false;
                });
        };

        vm.cleanList = (idEvent, isDuplicated) => {
            _.remove(vm.detailsDuplicated.duplicated, {id: idEvent});
            let duplicatedEmpty = vm.detailsDuplicated.duplicated.length === 0;
            if (duplicatedEmpty || isDuplicated) {
                let idDuplicado = vm.detailsDuplicated.id;
                _.map(vm.duplicateEvents, (events, key) => {
                    if (duplicatedEmpty) _.remove(events, {id: idDuplicado});
                    if (isDuplicated) _.remove(events, {idOrigin: idEvent});
                    if (events.length === 0) {
                        delete vm.duplicateEvents[key];
                        duplicatedEmpty ? vm.detailsDuplicated = undefined : null;
                    }
                });
                vm.duplicateEventsLength = Object.keys(vm.duplicateEvents).length;
            }
        };

        getEvents();

    }
})();