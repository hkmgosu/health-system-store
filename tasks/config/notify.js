/**
 * Automatic desktop notifications for Grunt errors and warnings. Supports OS X, Windows, Linux.
 * https://github.com/dylang/grunt-notify
 *
 */
module.exports = function(grunt) {
    grunt.config.set('notify', {
        watch: {
            options: {
                title: 'WATCH',
                message: 'Grunt is watching you.',
            }
        },
        assets: {
            options: {
                title: 'ASSETS',
                message: 'Assets compiled for you'
            }
        }
    });
    grunt.loadNpmTasks('grunt-notify');
};