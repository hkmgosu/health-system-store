(function () {
    'use strict';
    app.run(moduleRun);

    /* @ngInject */
    function moduleRun($rootScope, amMoment, $mdDialog, localStorageService) {
        $rootScope.$on('$viewContentLoaded', function (event) {
            if (!$('body').hasClass("loaded"))
                $('body').addClass('loaded');
        });

        amMoment.changeLocale('es');
        if (window.location.hostname === 'localhost') {
            setInterval(function () {
                console.log(AppUtils.getWatchers().length);
            }, 3000);
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