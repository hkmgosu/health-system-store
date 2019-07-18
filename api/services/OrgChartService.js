/* global sails */

// OrgChartService.js - in api/services

'use strict';

module.exports = {
    /**
     *
     * @param {type} options
     * @returns {undefined}
     */
    create: function (orgChart) {
        return new Promise( function(resolve, reject) {

            var saveOrgChart = function(){
                var fs = require('fs');
                sails.renderView('orgchart/tmpl', {
                    data  : orgChart.rows,
                    layout: 'layout',
                    title : 'Organigrama ' + orgChart.root.name
                }, (err, html) => {
                    if(err){
                        return reject(err);
                    } else{
                        let path = (sails.config.environment === 'production') ? '/var/www/' : '';
                        fs.writeFile(path + 'embed/' + orgChart.root.uuid + '.html', html, (err, data) => {
                            if (err){
                                return reject(err);
                            } else {
                                return resolve(orgChart.root);
                            }
                        });
                    }
                });
            };

            // Validar uuid existente
            if(orgChart.root.uuid){
                saveOrgChart();
            } else{
                var uuidV4 = require('uuid/v4');
                Unit.update({id: orgChart.root.id}, {uuid: uuidV4()}).exec(function(err, units){
                    if(err || units.length == 0){
                        return reject(err);
                    } else {
                        orgChart.root.uuid = units[0].uuid;
                        saveOrgChart();
                    }
                });
            }

        });
    }
};