(function () {
    'use strict';

    app.config(config);

    /* @ngInject */
    function config(triLayoutProvider, $stateProvider) {

        $stateProvider
            .state('triangular.mi-ssvq', {
                abstract: true,
                views: {
                    sidebarLeft: {
                        template: '<ssvq-public-sidebar></ssvq-public-sidebar>'
                    },
                    toolbar: {
                        template: '<ssvq-public-toolbar><ssvq-public-toolbar>'
                    },
                    content: {
                        template: '<ssvq-public-map></ssvq-public-map>'
                    }
                }
            });
        triLayoutProvider.setDefaultOption('toolbarSize', 'default');

        triLayoutProvider.setDefaultOption('toolbarShrink', true);

        triLayoutProvider.setDefaultOption('toolbarClass', '');

        triLayoutProvider.setDefaultOption('contentClass', '');

        triLayoutProvider.setDefaultOption('sideMenuSize', 'full');

        triLayoutProvider.setDefaultOption('showToolbar', true);

        triLayoutProvider.setDefaultOption('footer', false);
    }
})();