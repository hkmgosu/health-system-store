/**
 * TupleForm.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        nameForm: 'string',
        damageType: {
            model: 'DamageType'
        },
        eventType: {
            model: 'AdverseEventType'
        },
        associatedProcess: {
            model: 'AssociatedProcess'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};