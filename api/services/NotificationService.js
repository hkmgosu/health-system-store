/* global sails */

// NotificationService.js - in api/services

'use strict';

var send = async data => {

    const findGroup = async notification => {
        return await NotificationGroup.findOne({
            modelModule: notification.modelModule,
            idModelModule: notification.idModelModule,
            assignedTo: notification.assignedTo
        });
    };

    try {
        var group = await findGroup(data);
        if (group) {
            group.title = data.title;
            group.read = false;
            group.lastCreatedAt = new Date();
            group.count++;
            group.save();
        } else {
            data.count = 1;
            data.lastCreatedAt = new Date();
            group = await NotificationGroup.create(data);
        }
        data.groupedIn = group.id;
        Notification.create(data).then(() => { }, err => sails.log(err));
        return true;
    } catch (e) {
        sails.log(e);
        return false;
    }
};

module.exports = {
    sendNotifications: async notifications => {
        try {
            if (_.isArray(notifications)) {
                var setResult = [];
                for (const notification of notifications) {
                    setResult.push(await send(notification));
                }
                return { ok: true, obj: setResult };
            } else if (_.isObject(notifications)) {
                var result = await send(notifications);
                return { ok: true, obj: result };
            } else {
                return { ok: false, obj: [] };
            }
        } catch (e) {
            return { ok: false, obj: e };
        }
    }
}