/**
 * NotificationGroup.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    connection: 'mongodbServer',
    attributes: {
        title: 'string',// último titulo notificación
        assignedTo: {
            model: 'employee',
            required: true
        },
        read: {
            type: 'boolean',
            defaultsTo: false
        },
        count: 'integer',
        modelModule: {
            type: 'string',
            enum: [
                'request', 'derivation', 'adverseEvent', 'permission', 'viatic', 'rem'
            ]
        },
        idModelModule: 'integer',
        lastCreatedAt: 'datetime',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    afterCreate: function (notification, cb) {
        Employee.message(notification.assignedTo, {
            type: 'notificationGroup.new',
            data: notification
        });
        cb();
    },
    afterUpdate: function (notification, cb) {
        if (notification) {
            Employee.message(notification.assignedTo, {
                type: 'notificationGroup.update',
                data: notification
            });
        }
        cb();
    }
};

