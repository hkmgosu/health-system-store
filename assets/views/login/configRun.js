(function () {
    'use strict';
    app.run(moduleRun);

    /* @ngInject */
    function moduleRun($rootScope, localStorageService) {
        $rootScope.$on('$viewContentLoaded', function (event) {
            if (!$('body').hasClass("loaded"))
                $('body').addClass('loaded');
        });

        // Guardar desde donde viene para redireccionar al ingresar
        window.hashRef = window.location.hash;

        localStorageService.clearAll();
    }
})();