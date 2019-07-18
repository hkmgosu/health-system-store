/**
 * CauseUpp.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        uppNumber: 'integer',
        origin: {
            model: 'originoccurrence'
        },
        causedByDevice: {
            type: 'boolean',
            defaultsTo: false
        },
        localization: {
            model: 'localizationupp'
        },
        grade: {
            model: 'gradeupp'
        },
        formUpp: {
            model: 'formupp'
        },
        tracingUpp: {
            model: 'tracingUpp'
        },
        patient: {
            model: 'patient'
        },
        causeUpp: {
            model: 'causeupp'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};