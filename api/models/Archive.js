/**
 * Archive.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        fileFd: 'string',
        name: 'string',
        mimeType: 'string',
        size: 'integer',
        owner: {
            model: 'employee'
        },
        requests: {
            collection: 'request',
            via: 'archive',
            through: 'requestarchive'
        },
        derivationList: {
            collection: 'derivation',
            via: 'archive',
            through: 'derivationarchive'
        },
        derivationCommentList: {
            collection: 'derivationcomment',
            via: 'attachments'
        },
        comments: {
            collection: 'comment',
            via: 'archive',
            through: 'commentarchive'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        valid: {
            type: 'boolean',
            defaultsTo: false
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.fileFd;
            return obj;
        }
    }
};