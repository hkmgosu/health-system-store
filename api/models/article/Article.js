/**
 * Article.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        title: 'string',
        body: 'string',
        createdBy: { model: 'employee' },
        category: { model: 'articleCategory' },
        attachments: {
            collection: 'archive',
            via: 'attachment',
            through: 'articleattachment'
        },
        pictures: {
            collection: 'archive',
            via: 'picture',
            through: 'articlepicture'
        },
        tagListText: 'string',
        tagList: {
            collection: 'articletag',
            via: 'articleList'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

