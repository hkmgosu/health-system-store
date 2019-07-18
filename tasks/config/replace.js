module.exports = function (grunt) {
    var pipeline = require('../pipeline');
    grunt.config.set('replace', {
        dist: {
            options: {
                patterns: [
                    {
                        match: 'version',
                        replacement: pipeline.version
                    }
                ]
            },
            files: [
                {
                    expand: true,
                    flatten: true,
                    src: [pipeline.builtPath + '/manifest.json'],
                    dest: pipeline.builtPath
                }
            ]
        }
    });
    grunt.loadNpmTasks('grunt-replace');
  };