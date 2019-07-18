/**
 * ArticlePicture.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        article: { model: 'article' },
        picture: { model: 'archive' }
    },
    afterCreate: function (values, next) {
        Archive.update(values.picture, { valid: true }).exec(function () { });
        next();
    }
};
