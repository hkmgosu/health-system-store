/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 *      https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function (grunt) {
    var pipe = require('../pipeline');
    var _ = require('lodash');
    grunt.config.set('uglify', {
        dist: {
            options: {
                //beautify: true,
                //mangle: false
                preserveComments: false
            },
            files: [{
                expand: true,
                cwd: '.',
                src: _.concat(
                        _.filter(pipe.jsFilesToInject, function(o){
                            return !_.endsWith(o, '.min.js');
                        }),
                        _.filter(pipe.jsDashboardsFilesToInject, function(o){
                            return !_.endsWith(o, '.min.js');
                        }),
                        _.filter(pipe.jsLoginFilesToInject, function(o){
                            return !_.endsWith(o, '.min.js');
                        }),
                        _.filter(pipe.jsPublicFilesToInject, function(o){
                            return !_.endsWith(o, '.min.js');
                        })
                    ),
                dest: '.'
            }]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
};
