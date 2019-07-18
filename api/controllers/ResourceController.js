/**
 * ResourceController
 *
 * @description :: Server-side logic for managing Resources
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getList: (req, res) => {
        let filter = req.body.filter || {};
        let paginate = req.body.paginate || { page: 1, limit: 20 };
        let criteria = {
            or: [
                { model: { contains: filter.searchText || '' } },
                { ipAddress: { contains: filter.searchText || '' } },
                { macAddress: { contains: filter.searchText || '' } },
                { phoneNumber: { contains: filter.searchText || '' } },
                { contractNumber: { contains: filter.searchText || '' } },
                { serialNumber: { contains: filter.searchText || '' } }
            ]
        };

        if (!_.isEmpty(filter.currentEmployee)) {
            criteria.currentEmployee = filter.currentEmployee;
        }
        if (!_.isEmpty(filter.unit)) {
            criteria.unit = filter.unit;
        }
        if (!_.isEmpty(filter.establishment)) {
            criteria.establishment = filter.establishment;
        }
        if (!_.isEmpty(filter.status)) {
            criteria.status = filter.status;
        }
        if (!_.isEmpty(filter.type)) {
            criteria.type = filter.type;
        }

        async.parallel({
            count: cb => Resource.count(criteria).exec(cb),
            list: cb => {
                Resource.find(criteria)
                    .populate('establishment')
                    .populate('currentEmployee')
                    .populate('unit')
                    .paginate(paginate)
                    .exec(cb);
            }
        }, (err, results) => {
            if (err) { return res.send({ ok: false, obj: err }); }
            res.send({ ok: true, obj: results });
        });
    },
    getExportList: (req, res) => {
        let filter = req.body.filter || {};
        let criteria = {
            or: [
                { model: { contains: filter.searchText || '' } },
                { ipAddress: { contains: filter.searchText || '' } },
                { macAddress: { contains: filter.searchText || '' } },
                { phoneNumber: { contains: filter.searchText || '' } },
                { contractNumber: { contains: filter.searchText || '' } },
                { serialNumber: { contains: filter.searchText || '' } }
            ]
        };

        if (!_.isEmpty(filter.currentEmployee)) {
            criteria.currentEmployee = filter.currentEmployee;
        }
        if (!_.isEmpty(filter.unit)) {
            criteria.unit = filter.unit;
        }
        if (!_.isEmpty(filter.establishment)) {
            criteria.establishment = filter.establishment;
        }
        if (!_.isEmpty(filter.status)) {
            criteria.status = filter.status;
        }
        Resource.find(criteria).then(resourceList => {
            /**
             * Recorrer lista de recursos para obtener información de funcionario asignado
             */
            async.forEach(resourceList, (resource, cb) => {
                if (!resource.currentEmployeeResource) {
                    return async.setImmediate(cb);
                }
                EmployeeResource.findOne({
                    id: resource.currentEmployeeResource
                }).populate('employee').then(employeeResource => {
                    resource.currentEmployeeResource = employeeResource;
                    cb();
                }, cb);
            }, err => {
                if (err) { return res.send({ ok: false }); }
                res.send({ ok: true, obj: resourceList });
            });
        }, err => res.send({ ok: false, obj: err }));
    },
    create: (req, res) => {
        let resource = req.body.resource;
        Resource.create(resource).then(
            resourceCreated => res.send({ ok: true, obj: resourceCreated }),
            err => res.send({ ok: false, obj: err })
        );
    },
    update: (req, res) => {
        let resource = req.body.resource;
        if (!resource.id) { return res.send({ ok: false }); }
        Resource.update(resource.id, resource).then(
            resourceUpdated => res.send({ ok: true, obj: resourceUpdated }),
            err => res.send({ ok: false, obj: err })
        );
    },
    delete: (req, res) => {
        let idResource = req.body.idResource;
        Resource.update(idResource, { deleted: true }).then(
            resourceUpdated => { res.send({ ok: true, obj: resourceUpdated }) }
        );
    },
    updateLocationInfo: (req, res) => {

        let { resource, opts = {} } = req.body;

        if (_.isEmpty(resource) || !resource.id) { return res.badRequest(); }

        async.waterfall([
            //udpateResource
            cb => Resource.findOne(resource.id).then(resourceFinded => {
                Object.assign(resourceFinded, resource);
                resourceFinded.save(err => cb(err, resourceFinded));
            }, cb),
            //updateEmployeeResource
            (resourceFinded, cb) => {
                EmployeeResource.findOne({
                    resource: resource.id,
                    endDate: null
                }).then(employeeResource => {
                    async.parallel({
                        prev: cb => {
                            if (employeeResource && (employeeResource.employee !== resource.currentEmployee)) {
                                employeeResource.endDate = new Date();
                                employeeResource.save(() => {
                                    if (opts.notifyPrev) {
                                        Employee.findOne(resource.currentEmployee).then(employee => {
                                            EmailService.sendResourceAssignedNotification(employee, req.session.employee, resourceFinded, 'unassigned');
                                        }, err => sails.log(err));
                                    }
                                    cb();
                                });
                            } else { async.setImmediate(cb); }
                        },
                        new: cb => {
                            if (!employeeResource && resource.currentEmployee) {
                                EmployeeResource.create({
                                    employee: resource.currentEmployee,
                                    observations: resource.observations || '',
                                    resource: resource.id,
                                    startDate: new Date()
                                }).exec((created) => {
                                    if (opts.notify) {
                                        Employee.findOne(resource.currentEmployee).then(employee => {
                                            EmailService.sendResourceAssignedNotification(employee, req.session.employee, resourceFinded, 'assigned');
                                        }, err => sails.log(err));
                                    }
                                    cb();
                                });
                            } else { async.setImmediate(cb); }
                        }
                    }, cb);
                }, cb);
            }
        ], err => {
            if (err) { return res.serverError(err); }
            res.ok();
        });
    },
    getResourceTypeList: (req, res) => {
        ResourceType.find({ deleted: false }).then(
            resourceTypeList => res.send({ ok: true, obj: resourceTypeList }),
            err => res.send({ ok: false, obj: err })
        );
    },
    getResourceStatusList: (req, res) => {
        ResourceStatus.find({ deleted: false }).then(
            resourceStatusList => res.send({ ok: true, obj: resourceStatusList }),
            err => res.send({ ok: false, obj: err })
        );
    },
    /**
     * Obtener recursos asociados a funcionario logeado que realiza la solicitud
     */
    getMyEmployeeResourceList: (req, res) => {
        EmployeeResource.find({ employee: req.session.employee.id }).populate('resource').then(
            employeeResourceList => res.send({ ok: true, obj: employeeResourceList }),
            err => res.send({ ok: false })
        );
    },
    /**
     * Obtener lista de funcionarios que han usado un recurso determinado
     */
    getEmployeeListByResource: (req, res) => {
        let { idResource } = req.body;
        if (!idResource) { return res.send({ ok: false }); }

        EmployeeResource.find({ resource: idResource }).populate('employee').sort('id DESC').then(
            employeeResourceList => res.send({ ok: true, obj: employeeResourceList }),
            err => res.send({ ok: false })
        );
    },
    /**
     * Obtener lista de recursos que ha tenido un funcionario determinado
     */
    getEmployeeResourceList: (req, res) => {
        let { idEmployee } = req.body;
        if (!idEmployee) { return res.send({ ok: false }); }
        EmployeeResource.find({ employee: idEmployee }).populate('resource').then(
            employeeResourceList => res.send({ ok: true, obj: employeeResourceList }),
            err => res.send({ ok: false })
        );
    },
    /**
     * Coteja jsonData de recurso para obtener posibles funcionarios asignados
     */
    getAssignmentCoincidences: (req, res) => {
        let { jsonData } = req.body;
        if (_.isEmpty(jsonData)) { return res.send({ ok: false }); }

        let or = [];

        if (jsonData.userMail) {
            or = or.concat([
                { email: { contains: _.first(jsonData.userMail.split('@')) } },
                { personalEmail: { contains: _.first(jsonData.userMail.split('@')) } }
            ]);
        }
        if (jsonData.userAnnexe) {
            or.push({ annexe: { contains: jsonData.userAnnexe } });
        }
        if (jsonData.userName) {
            let filterText = (jsonData.userName || '')
                .toLowerCase()
                .normalize('NFKD')
                .replace(/[\u0300-\u036F\.\-]/g, '');
            filterText = '%' + filterText.replace(/\s+/g, '%') + '%';
            or.push({ searchText: { like: filterText } });
        }
        Employee.find({
            or: or,
            deleted: false
        }).limit(10)
            .populate('job')
            .populate('unit')
            .populate('establishment').then(
                employeeList => res.send({ ok: true, obj: employeeList }),
                err => res.send({ ok: false })
            );
    }
};