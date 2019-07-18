/**
 * Minify HTML
 * https://github.com/gruntjs/grunt-contrib-htmlmin
 *
 */
module.exports = function (grunt) {
    var pipe = require('../pipeline');
    grunt.config.set('htmlmin', {
        dist: {
            options: {
                removeComments: true,
                collapseWhitespace: true
            },
            files: [{
                expand: true,
                cwd: pipe.builtPath,
                src: ['views/**/*.html', 'components/**/*.html'],
                dest: pipe.builtPath
            }]
        }
    });
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
};