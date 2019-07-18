(function () {
    'use strict';
    app.config(moduleConfig);
    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider, $urlRouterProvider) {
        $translatePartialLoaderProvider.addPart('public');
        $stateProvider
            .state('triangular.mi-ssvq.search', {
                url: ''
            });
        $urlRouterProvider.when('/', '');
        $urlRouterProvider.otherwise('');
    }
    moduleConfig.$inject = ['$translatePartialLoaderProvider', '$stateProvider', 'triMenuProvider', '$urlRouterProvider'];
})();


