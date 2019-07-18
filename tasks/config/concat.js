/**
 * Concatenate files.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * .tmp/public/contact directory
 * [concat](https://github.com/gruntjs/grunt-contrib-concat)
 *
 * For usage docs see:
 *      https://github.com/gruntjs/grunt-contrib-concat
 */
module.exports = function (grunt) {
    var pipe = require('../pipeline');
    grunt.config.set('concat', {
        js: {
            src: pipe.jsFilesToInject,
            dest: pipe.builtPath + '/prod/production.min.js'
        },
        dashboardsJs: {
            src: pipe.jsDashboardsFilesToInject,
            dest: pipe.builtPath + '/prod/production-dashboard.min.js'
        },
        loginJs: {
            src: pipe.jsLoginFilesToInject,
            dest: pipe.builtPath + '/prod/production-login.min.js'
        },
        publicJs: {
            src: pipe.jsPublicFilesToInject,
            dest: pipe.builtPath + '/prod/production-public.min.js'
        },
        css: {
            src: pipe.cssFilesToInject,
            dest: pipe.builtPath + '/preprod/production.concat.css'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
};
