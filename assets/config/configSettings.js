(function () {
    'use strict';

    app.config(translateConfig);

    /* @ngInject */
    function translateConfig(triSettingsProvider, triRouteProvider, APP_LANGUAGES) {
        // set app name & logo (used in loader, sidemenu, login pages, etc)
        triSettingsProvider.setName('Mi SSVQ');
        triSettingsProvider.setLogo('/assets/images/logo.jpg');
        // set current version of app (shown in footer)
        triSettingsProvider.setVersion('0.2.0');

        // setup available languages in triangular
        for (var lang = APP_LANGUAGES.length - 1; lang >= 0; lang--) {
            triSettingsProvider.addLanguage({
                name: APP_LANGUAGES[lang].name,
                key: APP_LANGUAGES[lang].key
            });
        }

        triRouteProvider.setTitle('Mi SSVQ');
        triRouteProvider.setSeparator('|');
    }

    translateConfig.$inject = ['triSettingsProvider', 'triRouteProvider', 'APP_LANGUAGES'];
})();