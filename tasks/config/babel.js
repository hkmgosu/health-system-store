/**
 * Use next generation JavaScript, today, with Babel
 *
 */
module.exports = function(grunt) {
    var pipe = require('../pipeline');
    var _ = require('lodash');
    grunt.config.set('babel', {
        dist: {
            options: {
                sourceMap: false,
                presets: ['es2015', 'stage-3']
            },
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
            /*
            files: [
                {
                    expand: true,
                    cwd: pipe.builtPath + '/preprod/',
                    dest: pipe.builtPath + '/preprod',
                    src: ['*.concat.js'],
                    ext: '.compiled.js'
                }
            ]
            */
        }
    });

  grunt.loadNpmTasks('grunt-babel');
};