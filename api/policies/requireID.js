/**
 * requireID
 *
 * @module      :: Policy
 * @description :: Politica para validar requests que necesiten un id de consulta
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

'use strict';

module.exports = function (req, res, next) {
    if(req.body.id){
        next();
    } else {
        return res.badRequest();
    }
};
