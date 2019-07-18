(function () {
    'use strict';

    app.config(themesConfig);

    /* @ngInject */
    function themesConfig($mdThemingProvider) {
        /**
         *  PALETTES
         */
        $mdThemingProvider.definePalette('white', {
            '50': 'ffffff',
            '100': 'ffffff',
            '200': 'd1d1d1',
            '300': 'd1d1d1',
            '400': 'd1d1d1',
            '500': 'ffffff',
            '600': 'ffffff',
            '700': 'ffffff',
            '800': 'ffffff',
            '900': 'ffffff',
            'A100': 'ffffff',
            'A200': 'ffffff',
            'A400': 'ffffff',
            'A700': 'ffffff',
            'contrastDefaultColor': 'dark',
            'contrastDarkColors': [
                '50',
                '100',
                '200',
                '300',
                '400',
                '500',
                '600',
                '700',
                '800',
                '900',
                'A100',
                'A200',
                'A400',
                'A700'
            ],
            'contrastLightColors': []
        });

        $mdThemingProvider.definePalette('my-palette', {
            '50': 'e2edf6',
            '100': 'b7d2e9',
            '200': '87b4da',
            '300': '5796cb',
            '400': '3380bf',
            '500': '0f69b4',
            '600': '0d61ad',
            '700': '0b56a4',
            '800': '084c9c',
            '900': '043b8c',
            'A100': 'b8d0ff',
            'A200': '85afff',
            'A400': '528dff',
            'A700': '397cff',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': [
                '50',
                '100',
                '200',
                'A100',
                'A200'
            ],
            'contrastLightColors': [
                '300',
                '400',
                '500',
                '600',
                '700',
                '800',
                '900',
                'A400',
                'A700'
            ]
        });

        $mdThemingProvider.definePalette('my-accent', {
            '50': 'f2f2f2',
            '100': 'dedede',
            '200': 'c8c8c8',
            '300': 'b2b2b2',
            '400': 'a2a2a2',
            '500': '919191',
            '600': '898989',
            '700': '7e7e7e',
            '800': '747474',
            '900': '626262',
            'A100': '919191',
            'A200': '919191',
            'A400': 'ef4143',
            'A700': '919191',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': [
                '50',
                '100',
                '200',
                '300',
                '400'
            ],
            'contrastLightColors': [
                '500',
                '600',
                '700',
                '800',
                '900',
                'A100',
                'A200',
                'A400',
                'A700'
            ]
        });

        //warning #ef4143
        $mdThemingProvider.definePalette('warning', {
            '50': 'ef4143',
            '100': 'ef4143',
            '200': 'ef4143',
            '300': 'ef4143',
            '400': 'ef4143',
            '500': 'ef4143',
            '600': 'ef4143',
            '700': 'ef4143',
            '800': 'ef4143',
            '900': 'ef4143',
            'A100': 'ef4143',
            'A200': 'ef4143',
            'A400': 'ef4143',
            'A700': 'ef4143',
            'contrastDefaultColor': 'light'
        });

        $mdThemingProvider.theme('white')
            .primaryPalette('white', {
                'hue-1': '400'
            })
            .accentPalette('amber')
            .warnPalette('orange');

        $mdThemingProvider
            .theme('my-theme')
            .primaryPalette('my-palette', {
                'hue-1': '400'
            })
            .accentPalette('my-accent', {
                'hue-1': 'A400'
            })
            .warnPalette('red')
            .backgroundPalette('grey');

        $mdThemingProvider.setDefaultTheme('my-theme');
    }
})();