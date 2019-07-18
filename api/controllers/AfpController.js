/**
 * AfpController
 *
 * @description :: Server-side logic for managing Afps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getAll: function (req, res) {
        Afp
            .find({deleted: false})
            .exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok : false,
                        msg: 'AFP.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok : true,
                        msg: 'AFP.SEARCH.FOUND',
                        obj: {
                            afps: data
                        }
                    });
                }
            });
    }
};

