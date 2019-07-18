(() => {
    'use strict';

    app.directive('ssvqWizard', () => {
            return {
                bindToController: true,
                controller: ComponentController,
                controllerAs: 'ssvqWizard',
                restrict: 'A'
            };
        });

    /* @ngInject */
    function ComponentController($scope, $timeout) {
        var vm = this;

        var forms = [];
        var totalErrors = 0;
        var fixedErrors = 0;

        vm.currentStep = 0;
        vm.getForm = getForm;
        vm.isFormValid = isFormValid;
        vm.nextStep = nextStep;
        vm.nextStepDisabled = nextStepDisabled;
        vm.prevStep = prevStep;
        vm.prevStepDisabled = prevStepDisabled;
        vm.progress = 0;
        vm.registerForm = registerForm;
        vm.updateProgress = updateProgress;

        ////////////////

        function getForm(index) {
            return forms[index];
        }

        function nextStep() {
            vm.currentStep = vm.currentStep + 1;
        }

        function nextStepDisabled() {
            // get current active form
            var form = $scope.ssvqWizard.getForm(vm.currentStep);
            var formInvalid = true;
            if (angular.isDefined(form) && angular.isDefined(form.$invalid)) {
                formInvalid = form.$invalid;
            }
            return formInvalid;
        }

        function isFormValid(step) {
            if (angular.isDefined(forms[step])) {
                return forms[step].$valid;
            }
        }

        function prevStep() {
            vm.currentStep = vm.currentStep - 1;
        }

        function prevStepDisabled() {
            return vm.currentStep === 0;
        }

        function registerForm(form) {
            forms.push(form);
        }

        function updateProgress() {
            var errors = calculateErrors();
            fixedErrors = totalErrors - errors;

            // calculate percentage process for completing the wizard
            vm.progress = Math.floor((fixedErrors / totalErrors) * 100);
        }

        function calculateErrors() {
            var errorCount = 0;
            for (var form = forms.length - 1; form >= 0; form--) {
                if (angular.isDefined(forms[form].$error)) {
                    let tempForm = forms[form];
                    _.map(tempForm, (field, key) => {
                        if (!/^\$/.test(key) && (field || {}).constructor.name === 'FormController') {
                            _.map(field.$error, error => {
                                errorCount += error.length;
                            });
                        }
                    });
                    _.map(tempForm.$error, error => {
                        errorCount += error.length;
                    });
                }
            }
            return errorCount;
        }

        // init

        // wait until this tri wizard is ready (all forms registered)
        // then calculate the total errors
        $timeout(function () {
            totalErrors = calculateErrors();
        }, 1000);
    }
})();
(() => {
    'use strict';

    app.directive('ssvqWizardForm', WizardFormProgress);

    /* @ngInject */
    function WizardFormProgress() {
        // Usage:
        //  <div tri-wizard>
        //      <form ssvq-wizard-form>
        //      </form>
        //  </div>
        //
        var directive = {
            require: ['form', '^ssvqWizard'],
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs, require) {
            var ngFormCtrl = require[0];
            var wizardCtrl = require[1];

            // register this form with the parent wizard directive
            wizardCtrl.registerForm(ngFormCtrl);

            // watch for form input changes and update the wizard progress
            element.on('input', function () {
                wizardCtrl.updateProgress();
            });
        }
    }
})();