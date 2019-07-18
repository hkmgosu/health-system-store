/**
 * StorageCommentArchive.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    connection: sails.config.models.connectionStorage,
    attributes: {
        archive: {
            model: 'archive'
        },
        comment: {
            model: 'StorageComment'
        }
    },
    afterCreate: function(values, next) {
        Archive.update(values.archive, {
            valid: true
        }).exec(function() {});
        next();
    }
};