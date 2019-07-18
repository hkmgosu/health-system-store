/**
 * DrugType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: sails.config.models.connectionStorage,
    attributes: {
        description: 'string',
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    },
    beforeCreate(values, next) {
        DrugType.findOne({
            description: values.description,
            deleted: false
        }).exec((err, data) => {
            if (err) return next(err);
            if (!data) return next();

            let newErr = new Error;
            newErr.message = 'tipo de droga YA EXISTE';
            newErr.status = 500;
            return next(newErr);
        });
    }
};