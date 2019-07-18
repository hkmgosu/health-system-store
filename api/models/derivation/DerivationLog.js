/**
 * DerivationLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

module.exports = {
    migrate: 'safe',
    attributes: {
        derivation: {
            model: 'derivation',
            required: true,
            index: true
        },
        createdBy: {
            model: 'employee',
            required: true
        },
        obj: 'json',
        comment: 'string',
        description: 'string',
        type: {
            type: 'string',
            enum: ['comment', 'fromEstablishmentUpdated', 'toEstablishmentUpdated', 'statusUpdated']
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    afterCreate: (log, cb) => {
        DerivationLog.findOne(log.id).populate('createdBy').then(derivationLog => {
            Derivation.findOne(derivationLog.derivation)
                .populate('fromEstablishment')
                .populate('toEstablishment')
                .populate('attachments')
                .populate('fromUnit')
                .populate('toUnit')
                .populate('status')
                .populate('patient')
                .populate('createdBy')
                .populate('requiredEquipment').then(derivation => {
                    /**
                     * Envío de mensaje socket a clientes suscritos
                     */
                    Derivation.message(derivation.id, {
                        message: derivationLog.type,
                        log: derivationLog,
                        derivation: derivation
                    });

                    /**
                     * Envío de notificaciones a participantes de la derivación
                     */
                    DerivationStakeholder.find({
                        derivation: derivation.id,
                        deleted: false
                    }).then(stakeholderList => {
                        let title = '<b>' + derivationLog.createdBy.fullname + '</b> ';
                        switch (derivationLog.type) {
                            case 'statusUpdated':
                                title += 'actualizó el estado de una derivación donde participas';
                                break;
                            case 'toEstablishmentUpdated':
                                title += 'actualizó el destino de una derivación donde participas';
                                break;
                            case 'comment':
                                title += 'comentó en una derivación donde participas';
                                break;
                            case 'fromEstablishmentUpdated':
                                title += 'actualizó el origen de una derivación donde participas';
                                break;
                        }
                        let notificationList = [];
                        stakeholderList.forEach(stakeholder => {
                            notificationList.push({
                                assignedTo: stakeholder.employee,
                                title: title,
                                modelModule: 'derivation',
                                idModelModule: derivation.id,
                                type: 'Derivation'
                            });
                        });
                        NotificationService.sendNotifications(notificationList);
                    });
                });
        });
        cb();
    }
};