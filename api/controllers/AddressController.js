/**
 * AddressController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getAddressAutocomplete: (req, res) => {
        var request = require('request');
        let { searchText, bounds } = req.body;
        let urlRequest = 'https://nominatim.openstreetmap.org/search.php?street=' + searchText.replace(/\s/g, '+') + '&country=Chile&state=Valparaiso&format=json&addressdetails=1&email=ssvq.develop@gmail.com&limit=10&dedupe=1';
        if (bounds) {
            urlRequest += '&viewbox=' + [
                req.body.bounds.northEast.lat,
                req.body.bounds.northEast.lng,
                req.body.bounds.southWest.lat,
                req.body.bounds.southWest.lng
            ].join(',');
        }
        const utf8 = require('utf8');
        request({ url: utf8.encode(urlRequest), json: true }, function (err, response, body) {
            if (err || response.statusCode !== 200) { return res.serverError(err); }
            let addressResponse = [];
            body.forEach(result => {
                if (_.isEmpty(result.address.road)) { return; }
                if (_.find(addressResponse, addressResponseItem => (
                    (addressResponseItem.address.road === result.address.road) &&
                    (addressResponseItem.address.city === result.address.city)
                ))) { return; }
                addressResponse.push(result);
            });
            res.ok(addressResponse);
        });
    },
    getAddressAutocompleteReverse: (req, res) => {
        var request = require('request');
        let { lat, lng } = req.body;
        let urlRequest = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json&email=jfcisternasm@gmail.com&addressdetails=1';
        request({ url: urlRequest, json: true }, function (err, response, body) {
            if (err || response.statusCode !== 200) { return res.serverError(err); }
            res.ok(body);
        });
    }
};