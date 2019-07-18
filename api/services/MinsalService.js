/* global sails */

// MinsalService.js - in api/services

'use strict';

var moment = require('moment');

/**
 * Obtiene desde archivo token, si este ya no es valido obtiene uno nuevo
 */
var getToken = () => {
    const fs = require('fs-extra');

    // Datos de configuración
    const configMinsal  = sails.config.minsal;

    return new Promise( (resolve, reject) => {
        fs.readJson(configMinsal.pathToken, (err, accessToken) => {
            if (err) {
                generateToken().then(
                    response => resolve(response.accessToken),
                    err => reject(err)
                );
            } else {
                if (accessToken.token && (new Date() < new Date(accessToken.token.expires_at))) {
                    resolve(accessToken);
                } else {
                    generateToken().then(
                        response => resolve(response.accessToken),
                        err => reject(err)
                    );
                }
            }
        });
    });
};

/**
 * Genera un nuevo token y lo escribe a archivo
 */
var generateToken = () => {
    return new Promise( (resolve, reject) => {
        var fs = require('fs');

        // Datos de configuración
        const configMinsal  = sails.config.minsal;

        // configuration settings
        const credentials = {
            client: {
                id: configMinsal.env[configMinsal.apiActive].username,
                secret: configMinsal.env[configMinsal.apiActive].password
            },
            auth: {
                tokenHost: configMinsal.env[configMinsal.apiActive].baseUri
            },
            options: {
                useBasicAuthorizationHeader: true
            },
            http: {
                rejectUnauthorized : false
            }
        };

        const oauth2 = require('simple-oauth2').create(credentials);
        const tokenConfig = {};

        // Callbacks
        // Get the access token object for the client
        oauth2.clientCredentials.getToken(
            tokenConfig,
            (error, result) => {
                if (error) {
                    return reject('Access Token Error - ' + error.message);
                }

                const accessToken = oauth2.accessToken.create(result);
                sails.log(accessToken);

                fs.writeFile(configMinsal.pathToken, JSON.stringify(accessToken), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ok: true, accessToken: accessToken});
                    }
                });
            });
    });
};

/**
 * Valida que el rut sea valido y retorna objeto con el rut con dv separado
 */
var cleanAndValidateRut = (rut) => {
    // Dependencias
    const { validate, clean } = require('rut.js');

    if (!validate(rut)) {
        sails.log('Rut inválido');
        return { ok: false };
    }

    rut = clean(rut);

    return {
        ok: true,
        run: rut.substring(0, rut.length -1),
        dv: rut.charAt(rut.length -1)
    };

};

var mapPatient = data => {
    var firstLetterUpperCase = text => {
        return text.toLowerCase().replace(/^.|[^\S]./g, (match) => {
            return match.toUpperCase();
        });
    };
    return {
        name: firstLetterUpperCase(data.nombresPersona),
        lastname: firstLetterUpperCase(data.primerApellidoPersona),
        mlastname: firstLetterUpperCase(data.segundoApellidoPersona),
        birthdate: moment(data.fechaNacimiento, 'DD/MM/YYYY').toISOString(),
        gender: ((data) => {
            switch (data.codSexo) {
                case '01' : return 'male';
                case '02' : return 'female';
                default : return 'undefined';
            }
        })(data),
        identificationType: 'rut',
        identificationNumber: data.runPersona + data.dvPersona
    };
};

module.exports = {
    /**
     * Obtiene datos del paciente desde minsal pasando el rut
     */
    getPatient: (rut) => {
        return new Promise( (resolve, reject) => {
            const request = require('request-promise');

            // Datos de configuración
            const configMinsal  = sails.config.minsal;

            let validRut = cleanAndValidateRut(rut);
            if (!validRut.ok) {
                return async.setImmediate(() => reject({msg: 'Rut inválido'}));
            }

            getToken().then(
                accessToken => {
                    var options = {
                        method: 'GET',
                        uri: configMinsal.env[configMinsal.apiActive].baseUri + configMinsal.uriServices.basic,
                        qs: {
                            runPersona: validRut.run,
                            dvPersona: validRut.dv
                        },
                        headers: {
                            Authorization: accessToken.token.token_type + ' ' + accessToken.token.access_token
                        },
                        json: true,
                        rejectUnauthorized: false
                    };
                    request(options)
                        .then(response => {
                            if (response.codigo === 'OK') {
                                if (response.respuesta.estado.codigo === 'OK') {
                                    resolve(mapPatient(response.respuesta.resultado));
                                } else {
                                    reject({
                                        obj: {
                                            error: response.respuesta.estado.descripcion,
                                            observaciones: response.respuesta.observaciones
                                        }
                                    });
                                }
                            } else {
                                reject({msg: 'Ha ocurrido un error en la solicitud'});
                            }
                        })
                        .catch(err => reject({obj: err}));
                },
                err => reject({obj: err})
            );
        });
    }
};