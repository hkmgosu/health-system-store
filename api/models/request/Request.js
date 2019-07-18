/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        title: 'string',
        description: 'string',
        attachments: {
            collection: 'archive',
            via: 'request',
            through: 'requestarchive'
        },
        employeeAssigned: {
            model: 'employee'
        },
        unitAssigned: {
            model: 'unit'
        },
        createdBy: {
            model: 'employee'
        },
        label: {
            model: 'requestlabel'
        },
        state: {
            model: 'requeststate'
        },
        finished: {
            type: 'boolean',
            defaultsTo: false
        },
        dueDate: 'date',
        commentCount: {
            type: 'integer',
            defaultsTo: 0
        },
        stakeholders: {
            collection: 'employee',
            via: 'request',
            through: 'requeststakeholders'
        },
        assignmentLog: {
            collection: 'requestassignmentlog',
            via: 'request'
        },
        tags: 'string',
        tagsCollection: {
            collection: 'requesttag',
            via: 'requests'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        toJSON: function () {
            var obj = this.toObject();
            if (new Date(obj.dueDate) < new Date('01/01/2000')) {
                obj.dueDate = null;
            }
            return obj;
        }
    },
    beforeValidate: function (request, cb) {
        if (!request.dueDate) {
            request.dueDate = new Date(0);
        }
        cb();
    }
};