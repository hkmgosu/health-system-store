/**
 * AdverseEventLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        adverseEvent: {
            model: 'adverseEvent'
        },
        type     : 'string',
        createdBy: {
            model: 'employee'
        },
        data   : 'json'
    }
};

