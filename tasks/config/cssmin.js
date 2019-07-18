/**
 * Compress CSS files.
 *
 * ---------------------------------------------------------------
 *
 * Minify the intermediate concatenated CSS stylesheet which was
 * prepared by the `concat` task at `.tmp/public/concat/production.css`.
 *
 * Together with the `concat` task, this is the final step that minifies
 * all CSS files from `assets/styles/` (and potentially your LESS importer
 * file from `assets/styles/importer.less`)
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-cssmin
 *
 */
module.exports = function(grunt) {

  grunt.config.set('cssmin', {
    options: {
        keepSpecialComments: 0
    },
    dist: {
        src: ['.tmp/public/preprod/production.concat.css'],
        dest: '.tmp/public/prod/production.min.css'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
};
