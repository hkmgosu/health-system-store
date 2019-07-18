
module.exports = function (grunt) {
    var pipeline = require('../pipeline');
    grunt.config.set('merge-json', {
        es: {
            src: ["assets/components/**/es.json", "assets/views/**/il8n/es.json"],
            dest: pipeline.builtPath + '/il8n/es.json'
        }
    });
    grunt.loadNpmTasks('grunt-merge-json');
};