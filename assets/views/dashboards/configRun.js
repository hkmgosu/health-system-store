(function () {
    'use strict';
    app.run(moduleRun);

    /* @ngInject */
    function moduleRun($rootScope, amMoment, $mdDialog, localStorageService) {
        $rootScope.$on('$viewContentLoaded', function (event) {
            if (!$('body').hasClass("loaded"))
                $('body').addClass('loaded');

            setTimeout(() => {
                $('#loader-wrapper').remove();
            }, 1000);
        });

        amMoment.changeLocale('es');
        if (window.location.hostname === 'localhost') {
            setInterval(function () {
                console.log(AppUtils.getWatchers().length);
            }, 3000);
        }

        localStorageService.set('me', employee);

        if (!employee.firstUpdate) {
            $mdDialog.show({
                clickOutsideToClose: false,
                escapeToClose: false,
                template: '<md-dialog flex="60" flex-xs="80">' +
                    '  <md-dialog-content class="md-padding">' +
                    '     <ssvq-employee-personal-data></ssvq-employee-personal-data>' +
                    '  </md-dialog-content>' +
                    '</md-dialog>',
                controller: function () { }
            });
        }

        window.addEventListener("keydown", function (e) {
            if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
                if ($('#search').is(":focus")) {
                    console.log("Default action of CtrlF")
                    return true;
                } else {
                    if ($('#search')) {
                        e.preventDefault();
                        $('#search').focus();
                    }
                }
            }
        });
    }
})();