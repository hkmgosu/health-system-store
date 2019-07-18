/**
 * RecoveryLink.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        key: {
            type: 'string',
            defaultsTo: function() {
                var uuid = require('uuid/v4');
                return uuid();
            }
        },
        employee: {
            model: 'employee'
        },
        active: {
            type: 'boolean',
            defaultsTo: true
        }
    }
};