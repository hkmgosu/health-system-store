/**
 * EventConsequence.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        fixedField: {
            type: 'boolean',
            defaultsTo: false
        },
        visibleMedication: 'boolean',
        visibleFall: 'boolean',
        formsMed: {
            collection: 'formmedication',
            via: 'consequences'
        },
        formsFall: {
            collection: 'formfall',
            via: 'typesInjury'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};