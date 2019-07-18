/**
 * Derivation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        title: 'string',
        description: 'string',
        diagnostic: 'string',
        risk: {
            type: 'string',
            enum: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3']
        },
        requiredEquipment: {
            collection: 'equipment',
            via: 'derivationList'
        },
        attachments: {
            collection: 'archive',
            via: 'derivation',
            through: 'derivationarchive'
        },
        fromEstablishment: {
            model: 'establishment'
        },
        toEstablishment: {
            model: 'establishment'
        },
        fromUnit: {
            model: 'unit'
        },
        toUnit: {
            model: 'unit'
        },
        patient: {
            model: 'patient'
        },
        createdBy: {
            model: 'employee'
        },
        status: {
            model: 'DerivationStatus'
        },
        stakeholderList: {
            collection: 'employee',
            via: 'derivation',
            through: 'derivationstakeholder'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    afterCreate: (derivation, next) => {
        Establishment.findOne(derivation.toEstablishment)
            .populate('bedManagementSupervisors').then(establishment => {
                let notificationList = [];
                establishment.bedManagementSupervisors.forEach(supervisor => {
                    notificationList.push({
                        assignedTo: supervisor.id,
                        modelModule: 'derivation',
                        idModelModule: derivation.id,
                        title: 'Nueva derivación en establecimiento supervisado',
                        type: 'Derivation'
                    });
                });
                NotificationService.sendNotifications(notificationList);
            });
        next();
    }
};