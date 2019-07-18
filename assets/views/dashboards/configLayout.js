(function () {
    'use strict';

    app.config(config);

    /* @ngInject */
    function config($stateProvider, triLayoutProvider) {

        $stateProvider
            .state('triangular.mi-ssvq', {
                abstract: true,
                views: {
                    sidebarLeft: {
                        template: '<ssvq-dashboards-menu-sidebar></ssvq-dashboards-menu-sidebar>'
                    },
                    sidebarRight: {
                        template: '<ssvq-dashboards-notification-sidebar></ssvq-dashboards-notification-sidebar>'
                    },
                    toolbar: {
                        template: '<ssvq-dashboards-toolbar></ssvq-dashboards-toolbar>'
                    },
                    content: {
                        template: '<div id="admin-panel-content-view" class="overlay-5 {{layout.innerContentClass}}" flex ui-view></div>'
                    }
                }
            });

        triLayoutProvider.setDefaultOption('toolbarTemplateUrl', '/views/dashboards/app/tmpls/toolbar.tmpl.html');
        triLayoutProvider.setDefaultOption('toolbarSize', 'default');

        triLayoutProvider.setDefaultOption('toolbarShrink', true);

        triLayoutProvider.setDefaultOption('toolbarClass', '');

        triLayoutProvider.setDefaultOption('contentClass', 'my-container');

        triLayoutProvider.setDefaultOption('sideMenuSize', 'full');

        triLayoutProvider.setDefaultOption('showToolbar', true);

        triLayoutProvider.setDefaultOption('footer', false);
    }
    config.$inject = ['$stateProvider', 'triLayoutProvider'];
})();
