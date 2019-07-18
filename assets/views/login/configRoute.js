(function () {
    'use strict';

    app.config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider, localStorageServiceProvider, $urlRouterProvider) {
        $translatePartialLoaderProvider.addPart('login');

        $stateProvider
            .state('authentication', {
                abstract: true,
                templateUrl: '/views/login/modules/layouts/authentication.tmpl.html'
            })
            .state('authentication.login', {
                url: '/',
                template: '<ssvq-login class="full-width" flex></ssvq-login>'
            })
            .state('authentication.forgot', {
                url: '/forgot',
                templateUrl: '/views/login/modules/forgot/forgot.tmpl.html',
                controller: 'ForgotController',
                controllerAs: 'vm'
            })
            .state('authentication.recovery', {
                url: '/recovery/:key',
                templateUrl: '/views/login/modules/recovery/recovery.tmpl.html',
                controller: "RecoveryController",
                controllerAs: 'vm'
            });

        $urlRouterProvider.otherwise('/');

        localStorageServiceProvider
            .setPrefix('miSSVQ');

    }
})();