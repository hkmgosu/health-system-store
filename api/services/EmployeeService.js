/* global sails */

// EmailService.js - in api/services

'use strict';

module.exports = {
    uploadProfilePicture: (req, res, idEmployee) => {
        Employee.findOne(idEmployee).then(employee => {
            // Validar existencia de funcionario
            if (!employee) { return res.send({ ok: false }); }

            var fse = require('fs-extra');

            // Rutas donde se guardan los archivos
            var basePath = '.tmp/uploads/';
            var dirPath = new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate() + '/';

            fse.ensureDirSync(basePath + dirPath);
            req.file('file').upload({
                dirname: dirPath,
                maxBytes: 10000000
            }, function (err, filesUploaded) {
                if (err || _.isEmpty(filesUploaded)) {
                    sails.log(err);
                    return res.send({ ok: false, obj: err });
                }

                // Eliminar foto de perfil anterior
                if (employee.profilePicturePath) {
                    fse.remove(employee.profilePicturePath, err => sails.log(err));
                }

                // Actualizar registro de funcionario
                Object.assign(employee, {
                    hasProfilePicture: true,
                    profilePicturePath: filesUploaded[0].fd
                });
                employee.save(err => res.send({ ok: _.isEmpty(err) }));
            });
        }, () => res.send({ ok: false }));
    },
    deleteProfilePicture: (req, res, idEmployee) => {
        Employee.findOne(idEmployee).then(employee => {

            // Validar existencia de funcionario
            if (!employee) { return res.send({ ok: false }); }

            var fse = require('fs-extra');

            // Eliminar foto de perfil anterior
            if (employee.profilePicturePath) {
                fse.remove(employee.profilePicturePath, err => sails.log(err));
            }

            // Actualizar registro de funcionario
            Object.assign(employee, {
                hasProfilePicture: false,
                profilePicturePath: null
            });
            employee.save(err => res.send({ ok: _.isEmpty(err) }));
        });
    }
};