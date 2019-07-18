(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-type></ssvq-adverse-event-type>
     */
    app.directive('ssvqAdverseEventType', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '=',
                tupleSelected: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventDialog/adverseEventType/adverseEventType.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, adverseEventFactory) {
        var vm = this;
        var othersAdverseEvent = [];
        var organizedData = [];
        var sentinelDtId = 8;
        var adverseEventIds = adverseEventFactory.getDamageCategorization().adverse;
        var sentinelOthers = adverseEventFactory.getSentinelOthers();
        vm.completed;

        async.parallel([
            cb => adverseEventFactory.getAllEventType()
                .then(data => {
                    vm.eventTypes = data.eventTypes;
                    cb(null);
                })
                .catch(err => {
                    console.log(err);
                    vm.eventTypes = [];
                    cb(err);
                }),
            cb => adverseEventFactory.getAllTupleForm()
                .then(data => {
                    vm.tupleForms = data.tupleForms;
                    cb(null);
                })
                .catch(err => {
                    console.log(err);
                    vm.tupleForms = [];
                    cb(err);
                }),
            cb => adverseEventFactory.getAllAssociatedProcess()
                .then(data => {
                    vm.associatedProcesses = data.associatedProcesses;
                    cb(null);
                })
                .catch(err => {
                    console.log(err);
                    vm.associatedProcesses = [];
                    cb(err);
                })
        ], err => {
            if (err) console.log(err);
            else {
                organizeDataForView();
                vm.completed = true;
                if ((vm.data || {}).eventType) {
                    vm.data.eventType.id ? vm.data.eventType = vm.data.eventType.id : null;
                    vm.selectTuple(null, vm.data.eventType, false);
                    watchDamage(true);
                } else {
                    watchDamage();                    
                }
            }
        });

        vm.selectTuple = ($event, eventType, callDialog = true) => {
            if (eventType.id) vm.data.eventType = eventType.id;
            vm.tupleSelected = findTuple(eventType);
            if (callDialog && _.indexOf(adverseEventIds, vm.tupleSelected.damageType) !== -1 && vm.tupleSelected.eventType === 41) {
                showCentinelDialog($event, vm.tupleSelected);
            }
        };

        var findTuple = (eventType) => {
            if (eventType.tupleId) {
                return _.find(vm.tupleForms, { id: eventType.tupleId });
            } else {
                return _.find(vm.tupleForms, { damageType: vm.data.damageType, eventType: eventType })
            }
        };

        var selectOtherOption = (selected) => {
            vm.data.damageType = findTuple(selected).damageType;
            vm.selectTuple(null, selected);
        };

        //TODO: Crear funcion q llame a un dialog con las opciones q mandaron por correo
        var showCentinelDialog = ($event) => {
            return $mdDialog.show({
                targetEvent: $event || null,
                parent: angular.element(document.querySelector('#adverse-event-dialog')),
                multiple: true,
                clickOutsideToClose: false,
                escapeToClose: true,
                templateUrl: '/components/adverseEvent/adverseEventDialog/adverseEventType/centinelDialog.html',
                /* @ngInject */
                controller: function ($scope, options, selectOption) {
                    var vm = this;
                    vm.options = options;
                    vm.save = () => {
                        selectOption(vm.model);
                        $mdDialog.cancel();
                    };
                    vm.cancel = () => $mdDialog.cancel();
                },
                controllerAs: 'vm',
                locals: {
                    options: othersAdverseEvent,
                    selectOption: selectOtherOption
                }
            });
        };

        var organizeDataForView = () => {
            _.map(vm.tupleForms, (tuple) => {
                if (!tuple.eventType) return;

                // Buscar evento
                let event =  (_.find(vm.eventTypes, { id: tuple.eventType }) || {});
                // Objeto a insertar
                let tempTuple = {
                    id: tuple.eventType,
                    name: event.name,
                    description: event.description,
                    tupleId: tuple.id
                };

                // Donde se insertará el objeto
                if (_.some(organizedData, { damageType: tuple.damageType })) {
                    let temp = _.find(organizedData, { damageType: tuple.damageType });
                    if (temp.associatedProcesses) {
                        if (_.some(temp.associatedProcesses, { id: tuple.associatedProcess })) {
                            let tempAssociatedProcess = _.find(temp.associatedProcesses, { id: tuple.associatedProcess });
                            tempAssociatedProcess.eventTypes.push(tempTuple);
                        } else {
                            temp.associatedProcesses.push({
                                id: tuple.associatedProcess,
                                name: (_.find(vm.associatedProcesses, { id: tuple.associatedProcess }) || {}).name,
                                eventTypes: [tempTuple]
                            });
                        }
                    }
                } else {
                    organizedData.push({
                        damageType: tuple.damageType,
                        associatedProcesses: [{
                            id: tuple.associatedProcess,
                            name: (_.find(vm.associatedProcesses, { id: tuple.associatedProcess }) || {}).name,
                            eventTypes: [tempTuple]
                        }]
                    });
                }

                // Listado de otros centinelas para pop-up
                if (tuple.damageType === sentinelDtId &&  _.indexOf(sentinelOthers, tuple.eventType) !== -1) {
                    othersAdverseEvent.push({
                        id: tuple.eventType,
                        name: (_.find(vm.eventTypes, { id: tuple.eventType }) || {}).name,
                        tupleId: tuple.id
                    });
                }
            });
        };

        var watchDamage = (init = false) => {
            $scope.$watch(() => { return vm.data.damageType; }, (newVal, oldVal) => {
                if (init || (newVal && newVal !== oldVal)) {
                    vm.associatedProcessesFilter = angular.copy(_.find(organizedData, { damageType: newVal }).associatedProcesses);
                    init = false;
                }
            });
        };

    }
})();