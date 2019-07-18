/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    connection: 'mongodbServer',
    attributes: {
        title: 'string',
        assignedTo: {
            model: 'employee',
            required: true
        },
        assignedBy: {
            model: 'employee',
        },
        read: {
            type: 'boolean',
            defaultsTo: false
        },
        type: {
            type: 'string',
            enum: [
                'Notification',
                'Comment',
                'New-Request',
                'Request-Unit-Assignment',
                'Request-Employee-Assignment',
                'Request-State',
                'Request-Due-Date',
                'Request-Label',
                'Request-Stakeholder',
                'Derivation',
                'New-Event-Adverse',
                'State-Event-Status',
                'New-Permission',
                'Permission-Status',
                'Viatic',
                'Rem',
                'REM-GenericNotification'
            ],
            defaultsTo: 'Notification'
        },
        modelModule: {
            type: 'string',
            enum: [
                'request','derivation','adverseEvent','permission','viatic', 'rem'
            ]
        },
        idModelModule: 'integer',
        groupedIn: {
            model: 'notificationgroup'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};