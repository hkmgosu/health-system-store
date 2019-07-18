/**
 * AttentionItem.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        description: 'string',
        hasObservation: 'boolean',
        class: {
            model: 'attentionclass'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};