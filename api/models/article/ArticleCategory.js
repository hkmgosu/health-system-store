/**
 * ArticleCategory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        parent: { model: 'articlecategory' },
        private: {
            type: 'boolean',
            defaultsTo: false
        },
        hierarchy: 'string',
        managerList: {
            collection: 'employee',
            via: 'manager',
            through: 'articlecategorymanager'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

