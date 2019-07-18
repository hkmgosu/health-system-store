/**
 * PreventiveMeasure.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        description: 'string',
        hasObservation: 'boolean',
        predicated: 'string',
        visibleUpp: 'boolean',
        visibleFall: 'boolean',
        formsUpp: {
            collection: 'formupp',
            via: 'preventiveMeasure',
            through: 'formpreventivemeasure'
        },
        formsFall: {
            collection: 'formfall',
            via: 'preventiveMeasures'
        },
        fixedField: {
            type: 'boolean',
            defaultsTo: false
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};