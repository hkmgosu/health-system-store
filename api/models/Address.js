/**
 * Address.js
 * Fhir Resource https://www.hl7.org/fhir/datatypes.html#Address
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

'use strict';

/**
 * Asigna la categoría urbano o rural a la dirección que se está creando o editando
 */
let setCategory = (address) => {
    if (_.isEmpty(address.position)) { return; }
    let gju = require('geojson-utils');
    address.category = 'rural';
    Area.find({ category: 'urbano', deleted: false }).then(areaList => {
        areaList.forEach(area => {
            if (gju.pointInPolygon(address.position, area.geometry)) {
                address.category = 'urbano';
            }
        });
        Address.query(
            'update address set "category" = \'' + address.category + '\' where id = ' + address.id,
            err => { if (err) { sails.log(err); } }
        );
    });
};

module.exports = {
    migrate: 'safe',
    attributes: {
        use: {
            type: 'string',
            enum: ['home', 'work', 'temp', 'old'],
            defaultsTo: 'home'
        },
        type: {
            type: 'string',
            enum: ['postal', 'physical', 'both'],
            defaultsTo: 'physical'
        },
        text: 'string',
        //line
        city: 'string', // Ciudad
        district: {
            model: 'commune'
        }, // Comuna
        state: {
            model: 'region'
        }, //Region
        postalCode: 'string',
        country: {
            type: 'string',
            defaultsTo: 'CHL'
        },
        //period
        // Custom attributes
        position: {
            type: 'json'
        },
        zone: 'string',
        reference: 'string',
        category: {
            type: 'string',
            enum: ['rural', 'urbano']
        }
    },
    afterCreate: (address, cb) => {
        setCategory(address);
        cb();
    },
    afterUpdate: (address, cb) => {
        setCategory(address);
        cb();
    }
};