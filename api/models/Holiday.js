/**
 * Holiday.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        title: 'string',
        extra: 'string',
        law: 'array',
        lawId: 'array',
        validDate: {
            type: 'boolean',
            defaultsTo: true
        },
        date: {
            type: 'date',
            unique: 'true'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        toJSON: function () {
            var obj = this.toObject();
            obj.date = require('moment')(obj.date).format('DD-MM-YYYY');
            return obj;
        }
    }
};