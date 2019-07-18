/**
 * Add, remove and rebuild AngularJS dependency injection annotations. Based on ng-annotate.
 *
 */
module.exports = function(grunt) {
    var pipe = require('../pipeline');
    var _ = require('lodash');
    grunt.config.set('ngAnnotate', {
        dist: {
            files: [{
                expand: true,
                cwd: '.',
                src: _.concat(
                        _.filter(pipe.jsFilesToInject, function(o){
                            return o.indexOf('bower_components') === -1;
                        }),
                        _.filter(pipe.jsDashboardsFilesToInject, function(o){
                            return o.indexOf('bower_components') === -1;
                        }),
                        _.filter(pipe.jsLoginFilesToInject, function(o){
                            return o.indexOf('bower_components') === -1;
                        }),
                        _.filter(pipe.jsPublicFilesToInject, function(o){
                            return o.indexOf('bower_components') === -1;
                        })
                    ),
                dest: '.'
            }]
        }
    });

    grunt.loadNpmTasks('grunt-ng-annotate');
};