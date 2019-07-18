/**
 * ArticleCategoryController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getList: (req, res) => {
        if (!req.body.criteria) { return res.send({ ok: false }); }
        let criteria = _.merge(req.body.criteria || { parent: null }, { deleted: false });
        ArticleCategory.find(criteria).then(
            articleCategoryList => res.send({ ok: true, obj: articleCategoryList }),
            err => res.send({ ok: false, obj: err })
        );
    },
    getManagedList: (req, res) => {
        if (!req.body.criteria) { return res.send({ ok: false }); }
        let criteria = _.merge(req.body.criteria, { deleted: false });
        Employee.findOne(req.session.employee.id).populate('articleCategoryManagedList', {
            where: criteria,
            limit: 10
        }).then(
            employee => res.send({ ok: true, obj: employee.articleCategoryManagedList }),
            err => res.send({ ok: false, obj: err })
        );
    },
    getDetails: (req, res) => {
        let idCategory = req.body.idCategory;
        if (!idCategory) { return res.send({ ok: false }); }
        ArticleCategory.findOne(idCategory).then(
            category => res.send({ ok: true, obj: category }),
            err => res.send({ ok: false, obj: err })
        );
    },
    create: (req, res) => {
        let articleCategory = req.body.articleCategory;
        ArticleCategory.create(articleCategory).then(
            articleCategoryCreated => {
                /**
                 * Mapeo de jerarquía
                 */
                if (articleCategoryCreated.parent) {
                    ArticleCategory.findOne(articleCategoryCreated.parent).then(parent => {
                        articleCategoryCreated.hierarchy = parent.hierarchy + articleCategoryCreated.id + '.';
                        articleCategoryCreated.save((err) => res.send({ ok: true, obj: articleCategoryCreated }));
                    }, err => res.send({ ok: true, obj: articleCategoryCreated }));
                } else {
                    articleCategoryCreated.hierarchy = articleCategoryCreated.id + '.';
                    articleCategoryCreated.save((err) => res.send({ ok: true, obj: articleCategoryCreated }));
                }
            },
            err => res.send({ ok: false, obj: err })
        );
    },
    getBreadcrumbs: (req, res) => {
        let hierarchy = req.body.hierarchy;
        if (_.isEmpty(hierarchy)) { return res.send({ ok: false }); }
        ArticleCategory.find(hierarchy.split('.')).sort('hierarchy DESC').then(
            categoryList => res.send({ ok: true, obj: categoryList }),
            err => res.send({ ok: false, obj: err })
        );
    },
    edit: (req, res) => {
        let articleCategory = req.body.articleCategory;
        ArticleCategory.update(articleCategory.id, articleCategory).then(
            () => res.send({ ok: true }),
            err => res.send({ ok: false, obj: err })
        );
    },
    delete: (req, res) => {
        let idArticleCategory = req.body.idArticleCategory;
        ArticleCategory.update(idArticleCategory, { deleted: true }).then(
            () => res.send({ ok: true }),
            err => res.send({ ok: false, obj: err })
        );
    },
    getManagerList: (req, res) => {
        let idArticleCategory = req.body.idArticleCategory;
        ArticleCategory.findOne(idArticleCategory).populate('managerList').then(
            articleCategory => {
                res.send({ ok: true, obj: articleCategory.managerList });
            },
            err => res.send({ ok: false, obj: err })
        );
    },
    addManager: (req, res) => {
        let { idArticleCategory, idManager } = req.body;
        ArticleCategoryManager.create({
            manager: idManager,
            category: idArticleCategory
        }).then(articleCategoryManagerCreated => {
            if (!articleCategoryManagerCreated) { return res.send({ ok: false }); }
            res.send({ ok: true });
        });
    },
    removeManager: (req, res) => {
        let { idArticleCategory, idManager } = req.body;
        ArticleCategoryManager.destroy({
            manager: idManager,
            category: idArticleCategory
        }).then(articleCategoryManagerDestroyed => {
            if (!articleCategoryManagerDestroyed) { return res.send({ ok: false }); }
            res.send({ ok: true });
        });
    },
};