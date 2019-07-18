/**
 * RequestLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        request: {
            model: 'request'
        },
        type: 'string',
        createdBy: {
            model: 'employee'
        },
        data: 'json',
        dueDate: 'date',
        label: {
            model: 'requestlabel'
        }
    }
};