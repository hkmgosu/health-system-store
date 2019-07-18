/**
 * UtilitiesController
 *
 * @description :: Server-side logic for managing utilities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getDateTime: (req, res) => {
        return res.send({ dateTime: new Date() });
    }
};

