/**
 * FormFall.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        activityFall: {
            model: 'activityfall'
        },
        fromFall: {
            model: 'fromfall'
        },
        placeFall: {
            model: 'placefall'
        },
        typesInjury: {
            collection: 'eventconsequence',
            via: 'formsFall'
        },
        localizationInjury: 'string',
        preventiveMeasures: {
            collection: 'preventivemeasure',
            via: 'formsFall'
        },
        fallRisk: {
            model: 'riskcategorization'
        },
        previousFall: {
            model: 'previousFall'
        },
        consciousnessState: {
            model: 'consciousnessState'
        },
        typeMedicationUsed: {
            collection: 'typemedication',
            via: 'formsFall'
        },
        sensoryDeficit: {
            model: 'sensoryDeficit'
        },
        patientMovility: {
            model: 'patientmovility'
        },
        patientWalk: {
            model: 'patientwalk'
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