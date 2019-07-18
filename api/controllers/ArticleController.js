/**
 * ArticleController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';

module.exports = {
    getDetails: (req, res) => {
        let idArticle = req.body.idArticle;
        if (!idArticle) { return res.send({ ok: false }); }
        Article.findOne({ id: idArticle, deleted: false })
            .populate('createdBy')
            .populate('category')
            .populate('tagList')
            .populate('attachments')
            .populate('pictures').then(
                article => res.send({ ok: !_.isEmpty(article), obj: article }),
                err => res.send({ ok: false, obj: err })
            );
    },
    getList: (req, res) => {
        let criteria = _.merge(req.body.criteria, { deleted: false });
        let paginate = req.body.paginate || { page: 1, limit: 10 };

        if (!criteria) {
            return res.send({ ok: false })
        }

        ArticleCategory.find(criteria.category).then(categoryList => {
            if (_.isEmpty(categoryList)) { return res.send({ ok: false }); }

            let categoryCriteriaOr = [];

            categoryList.forEach(category => {
                categoryCriteriaOr.push({
                    hierarchy: { startsWith: category.hierarchy }
                });
            });

            ArticleCategory.find(categoryCriteriaOr).then(allCategoryList => {
                criteria.category = _.map(allCategoryList, 'id');
                Article.find({
                    where: criteria,
                    select: ['id', 'title', 'category', 'createdBy', 'createdAt', 'tagList', 'attachments', 'pictures']
                })
                    .paginate(paginate)
                    .sort('id DESC')
                    .populate('createdBy')
                    .populate('category')
                    .populate('tagList')
                    .populate('attachments')
                    .populate('pictures').then(
                        articleList => res.send({ ok: !_.isEmpty(articleList), obj: articleList }),
                        err => res.send({ ok: false, obj: err })
                    );
            });
        }, err => res.send({ ok: false }));
    },
    getManagedList: (req, res) => {
        if (!req.body.criteria) { return res.send({ ok: false }); }
        let criteria = _.merge(req.body.criteria, { deleted: false });
        let paginate = req.body.paginate || { page: 1, limit: 10 };

        Employee.findOne(req.session.employee.id).populate('articleCategoryManagedList', criteria.category).then(employee => {

            if (_.isEmpty(employee) || _.isEmpty(employee.articleCategoryManagedList)) { return res.send({ ok: false }); }

            let categoryCriteriaOr = [];
            employee.articleCategoryManagedList.forEach(category => {
                categoryCriteriaOr.push({
                    hierarchy: { startsWith: category.hierarchy }
                });
            });

            ArticleCategory.find({ or: categoryCriteriaOr }).then(categoryList => {
                // Lista definitiva de todas las categorías a incluir en la búsqueda de publicaciones
                criteria.category = _.map(categoryList, 'id');
                Article.find({
                    where: criteria,
                    select: ['id', 'title', 'category', 'createdBy', 'createdAt', 'tagList', 'attachments', 'pictures']
                })
                    .paginate(paginate)
                    .sort('id DESC')
                    .populate('createdBy')
                    .populate('category')
                    .populate('tagList')
                    .populate('attachments')
                    .populate('pictures').then(
                        articleList => res.send({ ok: !_.isEmpty(articleList), obj: articleList }),
                        err => res.send({ ok: false, obj: err })
                    );
            });
        }, err => res.send({ ok: false, obj: err }));
    },
    create: (req, res) => {
        let article = req.body.article;
        article.createdBy = req.session.employee.id;
        let tagIds = [];
        async.forEach(article.tagList, (tag, cb) => {
            if (tag.id) {
                tagIds.push(tag.id);
                return async.setImmediate(cb);
            }
            ArticleTag.create({ name: tag.name }).then((tagCreated) => {
                tagIds.push(tagCreated.id);
                cb();
            }, cb);
        }, err => {
            if (err) { return res.send({ ok: false, obj: err }); }
            article.tagList = tagIds;
            Article.create(article).then(
                articleCreated => res.send({ ok: true, obj: articleCreated }),
                err => res.send({ ok: false, obj: err })
            );
        });
    },
    edit: (req, res) => {
        let article = req.body.article;
        let tagIds = [];
        async.forEach(article.tagList, (tag, cb) => {
            if (tag.id) {
                tagIds.push(tag.id);
                return async.setImmediate(cb);
            }
            ArticleTag.create({ name: tag.name }).then((tagCreated) => {
                tagIds.push(tagCreated.id);
                cb();
            }, cb);
        }, err => {
            if (err) { return res.send({ ok: false, obj: err }); }
            article.tagList = tagIds;
            Article.update(article.id, article).then(
                articleUpdated => res.send({ ok: !_.isEmpty(articleUpdated) }),
                err => res.send({ ok: false, obj: err })
            );
        });
    },
    delete: (req, res) => {
        let idArticle = req.body.idArticle;
        Article.update(idArticle, { deleted: true }).then(
            articleUpdated => res.send({ ok: !_.isEmpty(articleUpdated) }),
            err => res.send({ ok: false, obj: err })
        );
    },
    getTagList: (req, res) => {
        let searchtext = req.body.searchtext || '';
        ArticleTag.find({ name: { startsWith: searchtext } }).then(
            tagList => res.send({ ok: true, obj: tagList }),
            err => res.send({ ok: false, obj: err })
        );
    }
};