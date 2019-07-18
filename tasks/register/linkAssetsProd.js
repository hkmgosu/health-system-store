/**
 * `linkAssetsProd`
 *
 * ---------------------------------------------------------------
 *
 */
module.exports = function (grunt) {
    grunt.registerTask('linkAssetsProd', [
        'sails-linker:prodJs',
        'sails-linker:prodJsDashboard',
        'sails-linker:prodJsLogin',
        'sails-linker:prodJsPublic',
        'sails-linker:prodStyles'
    ]);
};
