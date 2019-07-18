/**
 * `watch`
 *
 * ---------------------------------------------------------------
 *
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * Watch for changes on:
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function (grunt) {

    grunt.config.set('chokidar', {
        assets: {

            // Assets to watch:
            files: ['assets/components/**/*', 'assets/factories/**/*', 'assets/views/**/*', 'assets/filters/**/*', 'tasks/pipeline.js'],

            // When assets are changed:
            tasks: ['syncAssets', 'linkAssets', 'notify:assets']
        },
        options: {
            livereload: true,
            interval: 1000
        }
    });

    grunt.loadNpmTasks('grunt-chokidar');
};