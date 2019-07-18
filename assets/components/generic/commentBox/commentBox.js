(function () {
    'use strict';
    /**
     * Example
     * <ssvq-comment-box comment=""></ssvq-comment-box>
     */
    app.directive('ssvqCommentBox', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                comment: '=',
                onCreate: '&?',
                opts: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/generic/commentBox/commentBox.html'
        };
    });

    /* @ngInject */
    function ComponentController($element, $scope, $mdToast, employeeFactory) {
        var vm = this;
        let defaultComment = { description: '', attachments: [] };

        vm.employee = employee;
        vm.comment = angular.copy(defaultComment);
        vm.loading = false;

        vm.opts = _.merge({
            placeholderText: 'Escribir un comentario',
            submitText: 'Enviar comentario',
            unitRoot: '',
            attachments: true,
            confirmButton: true
        }, vm.opts);

        vm.fields = {
            fullname: true,
            job: true,
            establishment: true,
            contact: true
        };

        vm.createComment = () => {
            if (!vm.onCreate) { return console.log('Falta función de envío'); }
            vm.loading = true;
            vm.onCreate()(vm.comment).then(() => {
                vm.comment = angular.copy(defaultComment);
                $element.find('.customContentEditable').html('');
                vm.loading = false;
                $scope.$apply();
            }, () => {
                vm.loading = false;
                $mdToast.showSimple('Lo sentimos, ha ocurrido un error en la operación realizada');
                $scope.$apply();
            });
        };

        vm.onPaste = $event => {
            let e = $event.originalEvent;
            e.preventDefault();
            if (!(e.clipboardData && e.clipboardData.items)) { return; }
            for (let item of e.clipboardData.items) {

                if (!item.type.includes('image')) {
                    // get text representation of clipboard
                    var text = ($event.originalEvent || $event).clipboardData.getData('text/plain');
                    // insert text manually
                    document.execCommand("insertText", false, text);
                    continue;
                }
                vm.uploadFiles([item.getAsFile()]);
            }
        };

        vm.people = [];
        vm.searchPeople = searchText => new Promise((resolve, reject) => {
            employeeFactory.getList({
                filter: searchText,
                opts: { unitRootHierarchy: vm.opts.unitRoot }
            }).then(list => {
                vm.people = list.map(employee => {
                    return Object.assign(employee, {
                        fields: {
                            fullname: true,
                            job: true,
                            establishment: true
                        }
                    });
                });
            }, () => resolve([]));
        });

        vm.getPeopleText = employee => '<ssvq-employee-profile-link id-employee="' + employee.id + '" contenteditable="false">' + employee.fullname + '</ssvq-employee-profile-link>';

        $scope.$watch(
            () => vm.comment.attachments,
            newVal => vm.loadingFiles = !_.every(newVal, 'id'),
            true
        );
    }
})();