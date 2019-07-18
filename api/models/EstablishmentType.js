/**
 * EstablishmentType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        shortname: 'string',
        hasIcon: 'boolean',
        iconFd: 'string',
        description: 'string',
        establishments: {
            collection: 'establishment',
            via: 'type'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        toJSON: function() {
            var obj = this.toObject();
            delete obj.iconFd;
            return obj;
        }
    }
};