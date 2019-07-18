/**
 * Medicine.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    migrate: 'safe',
    attributes: {
        name: 'string',
        presentation: 'string',
        cod: 'string',
        vias: {
            collection: 'medicinevia',
            via: 'medicine'
        },
        visibleSamu: 'boolean',
        categoryMedicine: {
            model: 'categorymedicine'
        },
        subCategoryMedicine: {
            model: 'subcategorymedicine'
        },
        drugCategory: {
            model: 'drugcategory'
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};