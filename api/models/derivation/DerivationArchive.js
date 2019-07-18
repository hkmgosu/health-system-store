/**
 * DerivationArchive.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        archive: {
            model: 'archive'
        },
        derivation: {
            model: 'derivation'
        }
    },
    afterCreate: function (values, next) {
        Archive.update(values.archive, {
            valid: true
        }).exec(function () { });
        next();
    }
};