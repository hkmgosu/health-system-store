/**
 * NotificationController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getMine: async (req, res) => {
        let paginate = req.body.paginate || {
            page: 1,
            limit: 15
        };
        let criteria = {
            deleted: false,
            assignedTo: req.session.employee.id
        };

        const getNotificationGroups = async () => {
            return {
                unreadCount: await NotificationGroup.count(_.extend({ read: false }, criteria)),
                list: await NotificationGroup.find(criteria).sort('updatedAt DESC').paginate(paginate)
            };
        };

        try {
            var resp = await getNotificationGroups();
            res.send({ ok: true, obj: resp });
        } catch (e) {
            sails.log(e);
            res.send({ ok: false });
        }
    },
    getGroup: async (req, res) => {
        if (!req.body.groupId) return res.negotiate('Falta identificador de grupo de notificaciones');
        let criteria = {
            deleted: false,
            assignedTo: req.session.employee.id,
            groupedIn: req.body.groupId
        };

        try {
            var resp = await Notification.find(criteria).sort('id DESC');
            resp.shift();
            res.send({ ok: true, obj: resp });
        } catch (e) {
            sails.log(e);
            res.negotiate(e);
        }
    },
    markAllAsReaded: function (req, res) {
        Notification.update({
            assignedTo: req.session.employee.id,
            read: false
        }, {
                read: true
            }).then(
                () => res.send({ ok: true }),
                (err) => res.send({ ok: false, obj: err })
            );
    },
    toggleReaded: async (req, res) => {

        let notification = req.body.notification;
        if (!notification.id) {
            return res.send({ ok: false });
        }

        const toggleReaded = async () => {
            const notificationGroupUpdate = NotificationGroup.update(
                { id: notification.id, assignedTo: req.session.employee.id },
                { read: !notification.read }
            );
            const notificationUpdate = Notification.update(
                {
                    groupedIn: notification.id,
                    assignedTo: req.session.employee.id
                },
                { read: !notification.read }
            );
            return {
                group: await notificationGroupUpdate,
                notifications: await notificationUpdate
            };
        };

        try {
            await toggleReaded();
            res.send({ ok: true });
        } catch (e) {
            sails.log(e);
            res.send({ ok: false });
        }
    },
    subscribe: function (req, res) {
        Employee.subscribe(req, req.session.employee.id);
        return res.send({ ok: true, msg: 'NOTIFICATION.SUBSCRIBE.OK', obj: {} });
    }
};

