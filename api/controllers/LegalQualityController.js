/**
 * LegalQualityController
 *
 * @description :: Server-side logic for managing Legalqualities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getAll: function (req, res) {
        LegalQuality
            .find({ deleted: false })
            .exec(function (err, data) {
                if (err) {
                    return res.send({
                        ok: false,
                        msg: 'LEGALQUALITY.SEARCH.ERROR',
                        obj: {}
                    });
                } else {
                    return res.send({
                        ok: true,
                        msg: 'LEGALQUALITY.SEARCH.FOUND',
                        obj: {
                            legalQualitys: data
                        }
                    });
                }
            });
    }
};

