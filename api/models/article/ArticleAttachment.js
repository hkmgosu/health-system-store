/**
 * ArticleAttachment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        article: { model: 'article' },
        attachment: { model: 'archive' }
    },
    afterCreate: function (values, next) {
        Archive.update(values.attachment, { valid: true }).exec(function () { });
        next();
    }
};
