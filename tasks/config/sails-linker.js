/**
 * Autoinsert script tags (or other filebased tags) in an html file.
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags for javascript files and <link> tags
 * for css files.  Also automatically links an output file containing precompiled
 * templates using a <script> tag.
 *
 * For usage docs see:
 * 		https://github.com/Zolmeister/grunt-sails-linker
 *
 */
module.exports = function (grunt) {
    var pipeline = require('../pipeline');
    grunt.config.set('sails-linker', {
        devJs: {
            options: {
                startTag: '<!--SCRIPTS-->',
                endTag: '<!--SCRIPTS END-->',
                fileTmpl: '<script src="%s" defer></script>',
                appRoot: '.tmp/public'
            },
            files: {
                'views/**/*.ejs': pipeline.jsFilesToInject
            }
        },
        devJsDashboard: {
            options: {
                startTag: '<!--SCRIPTS DASHBOARD-->',
                endTag: '<!--SCRIPTS DASHBOARD END-->',
                fileTmpl: '<script src="%s" defer></script>',
                appRoot: '.tmp/public'
            },
            files: {
                'views/**/*.ejs': pipeline.jsDashboardsFilesToInject
            }
        },
        devJsLogin: {
            options: {
                startTag: '<!--SCRIPTS LOGIN-->',
                endTag: '<!--SCRIPTS LOGIN END-->',
                fileTmpl: '<script src="%s" defer></script>',
                appRoot: '.tmp/public'
            },
            files: {
                'views/**/*.ejs': pipeline.jsLoginFilesToInject
            }
        },
        devJsPublic: {
            options: {
                startTag: '<!--SCRIPTS PUBLIC-->',
                endTag: '<!--SCRIPTS PUBLIC END-->',
                fileTmpl: '<script src="%s" defer></script>',
                appRoot: '.tmp/public'
            },
            files: {
                'views/**/*.ejs': pipeline.jsPublicFilesToInject
            }
        },
        devJsRelative: {
            options: {
                startTag: '<!--SCRIPTS-->',
                endTag: '<!--SCRIPTS END-->',
                fileTmpl: '<script src="%s"></script>',
                appRoot: '.tmp/public',
                relative: true
            },
            files: {
                '.tmp/public/**/*.html': pipeline.jsFilesToInject,
                'views/**/*.html': pipeline.jsFilesToInject,
                'views/**/*.ejs': pipeline.jsFilesToInject
            }
        },
        prodJs: {
            options: {
                startTag: '<!--SCRIPTS-->',
                endTag: '<!--SCRIPTS END-->',
                fileTmpl: '<script src="%s" defer></script>',
                appRoot: pipeline.builtPath
            },
            files: {
                'views/**/*.ejs': [pipeline.productionJS]
            }
        },
        prodJsDashboard: {
            options: {
                startTag: '<!--SCRIPTS DASHBOARD-->',
                endTag: '<!--SCRIPTS DASHBOARD END-->',
                fileTmpl: '<script src="%s" defer></script>',
                appRoot: pipeline.builtPath
            },
            files: {
                'views/**/*.ejs': [pipeline.productionDashboardsJS]
            }
        },
        prodJsLogin: {
            options: {
                startTag: '<!--SCRIPTS LOGIN-->',
                endTag: '<!--SCRIPTS LOGIN END-->',
                fileTmpl: '<script src="%s" defer></script>',
                appRoot: pipeline.builtPath
            },
            files: {
                'views/**/*.ejs': [pipeline.productionLoginJS]
            }
        },
        prodJsPublic: {
            options: {
                startTag: '<!--SCRIPTS PUBLIC-->',
                endTag: '<!--SCRIPTS PUBLIC END-->',
                fileTmpl: '<script src="%s" defer></script>',
                appRoot: pipeline.builtPath
            },
            files: {
                'views/**/*.ejs': [pipeline.productionPublicJS]
            }
        },
        prodJsRelative: {
            options: {
                startTag: '<!--SCRIPTS-->',
                endTag: '<!--SCRIPTS END-->',
                fileTmpl: '<script src="%s"></script>',
                appRoot: '.tmp/public',
                relative: true
            },
            files: {
                '.tmp/public/**/*.html': ['.tmp/public/min/production.min.js'],
                'views/**/*.html': ['.tmp/public/min/production.min.js'],
                'views/**/*.ejs': ['.tmp/public/min/production.min.js']
            }
        },
        devStyles: {
            options: {
                startTag: '<!--STYLES-->',
                endTag: '<!--STYLES END-->',
                fileTmpl: '<link rel="stylesheet" href="%s">',
                appRoot: '.tmp/public'
            },
            files: {
                '.tmp/public/**/*.html': pipeline.cssFilesToInject,
                'views/**/*.html': pipeline.cssFilesToInject,
                'views/**/*.ejs': pipeline.cssFilesToInject
            }
        },
        devStylesRelative: {
            options: {
                startTag: '<!--STYLES-->',
                endTag: '<!--STYLES END-->',
                fileTmpl: '<link rel="stylesheet" href="%s">',
                appRoot: '.tmp/public',
                relative: true
            },
            files: {
                '.tmp/public/**/*.html': pipeline.cssFilesToInject,
                'views/**/*.html': pipeline.cssFilesToInject,
                'views/**/*.ejs': pipeline.cssFilesToInject
            }
        },
        prodStyles: {
            options: {
                startTag: '<!--STYLES-->',
                endTag: '<!--STYLES END-->',
                fileTmpl: '<link rel="stylesheet" href="%s">',
                appRoot: '.tmp/public'
            },
            files: {
                'views/**/*.ejs': [pipeline.productionCSS]
            }
        },
        prodStylesRelative: {
            options: {
                startTag: '<!--STYLES-->',
                endTag: '<!--STYLES END-->',
                fileTmpl: '<link rel="stylesheet" href="%s">',
                appRoot: '.tmp/public',
                relative: true
            },
            files: {
                '.tmp/public/index.html': ['.tmp/public/min/production.min.css'],
                'views/**/*.html': ['.tmp/public/min/production.min.css'],
                'views/**/*.ejs': ['.tmp/public/min/production.min.css']
            }
        },
        // Bring in JST template object
        devTpl: {
            options: {
                startTag: '<!--TEMPLATES-->',
                endTag: '<!--TEMPLATES END-->',
                fileTmpl: '<script type="text/javascript" src="%s"></script>',
                appRoot: '.tmp/public'
            },
            files: {
                '.tmp/public/index.html': ['.tmp/public/jst.js'],
                'views/**/*.html': ['.tmp/public/jst.js'],
                'views/**/*.ejs': ['.tmp/public/jst.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-sails-linker');
};
