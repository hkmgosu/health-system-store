module.exports = function (grunt) {

    grunt.config.set('sw-precache', {
        options: {
            baseDir: '.tmp/public',
            cacheId: 'missvq',
            verbose: true,
            maximumFileSizeToCacheInBytes: 4194304
        },
        default: {
            staticFileGlobs: [
                'components/**/**/*.{js,html,css,png,jpg,gif}'
            ]
        },
        dev: {
            handleFetch: false,
            importScripts: ['sw-push.js'],
            staticFileGlobs: []
        },
        prod: {
            handleFetch: true,
            importScripts: ['sw-push.js'],
            staticFileGlobs: [
                'manifest.json',
                'assets/**/**/*.{png,jpg,gif}',
                'il8n/es.json',
                'prod/production.min.{js,css}',
                'prod/production*.{js,css}',
                'components/**/*.{html,json}',
                'views/{dashboards,public,login}/**/*.{html,json}',
                'fonts/**'
            ]
        }
    });
    grunt.loadNpmTasks('grunt-sw-precache');

};