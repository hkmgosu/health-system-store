/**
 * FormUpp.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        causes: {
            collection: 'causeupp',
            via: 'formUpp'
        },
        dependenceRisk: {
            model: 'dependencerisk'
        },
        uppRisk: {
            model: 'riskcategorization'
        },
        preventiveMeasures: {
            collection: 'preventivemeasure',
            via: 'formUpp',
            through: 'formpreventivemeasure'
        },
        adverseEvent: {
            model: 'adverseEvent'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};