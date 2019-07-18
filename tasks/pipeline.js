/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files, and the ! prefix for excluding files.)
 */

// Path to public folder
var tmpPath = '.tmp/public/';

//path para cargar los css y js minificados de productivo
//var productionPath = "http://localhost/tracingMobile/tracingMobileApp/built/";
var productionPath = "";

// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
    "/bower_components/angular-material-data-table/dist/md-data-table.min.css",
    "/bower_components/fullcalendar/dist/fullcalendar.min.css",
    "/bower_components/font-awesome/css/font-awesome.min.css",
    "/bower_components/material-design-iconic-font/dist/css/material-design-iconic-font.min.css",
    "/bower_components/textAngular/src/textAngular.css",
    "/bower_components/angular-material/angular-material.min.css",
    "/bower_components/triangular/triangular.min.css",
    "/bower_components/animate.css/animate.min.css",
    "/bower_components/ng-img-crop/compile/unminified/ng-img-crop.css",
    "/bower_components/swiper/dist/css/swiper.min.css",
    "/bower_components/leaflet/dist/leaflet.css",
    "/bower_components/leaflet-draw/dist/leaflet.draw.css",
    "/bower_components/leaflet.markercluster/dist/MarkerCluster.css",
    "/bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css",
    "/leaflet.iconlabel.css",
    '/custom.css',
    '/preloader.css',
    '/components/**/*.css',
    '/views/**/*.css',
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [
    // Load sails.io before everything else
    //'/sails.io.js', Se agrega directo en views
    '/service-worker-registration.js',
    "/utils.js",
    "/bower_components/jquery/dist/jquery.min.js",
    "/bower_components/underscore/underscore-min.js",
    "/bower_components/lodash/dist/lodash.min.js",
    "/bower_components/async/dist/async.js",
    "/bower_components/angular/angular.js",
    "/bower_components/angular-filter/dist/angular-filter.js",
    "/bower_components/angular-animate/angular-animate.min.js",
    "/bower_components/angular-cookies/angular-cookies.min.js",
    "/bower_components/angular-digest-hud/digest-hud.js",
    "/bower_components/angular-simple-logger/dist/angular-simple-logger.min.js",
    "/bower_components/angular-linkify/angular-linkify.min.js",
    "/bower_components/angular-local-storage/dist/angular-local-storage.min.js",
    "/bower_components/angular-aria/angular-aria.js",
    "/bower_components/angular-material/angular-material.js",
    "/bower_components/triangular/triangular.js",
    "/bower_components/angular-messages/angular-messages.min.js",
    "/bower_components/moment/min/moment.min.js",
    "/bower_components/moment/locale/es.js",
    "/bower_components/angular-moment/angular-moment.min.js",
    "/bower_components/angular-resource/angular-resource.js",
    "/bower_components/angular-translate/angular-translate.js",
    "/bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js",
    "/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js",
    "/bower_components/angular-translate-storage-local/angular-translate-storage-local.js",
    "/bower_components/angular-ui-router/release/angular-ui-router.js",
    "/bower_components/rangy/rangy-core.min.js",
    "/bower_components/rangy/rangy-classapplier.min.js",
    "/bower_components/rangy/rangy-highlighter.min.js",
    "/bower_components/rangy/rangy-selectionsaverestore.min.js",
    "/bower_components/rangy/rangy-serializer.min.js",
    "/bower_components/rangy/rangy-textrange.min.js",
    "/bower_components/textAngular/src/textAngular-sanitize.js",
    "/bower_components/angulartics/dist/angulartics.min.js",
    "/bower_components/angulartics-google-analytics/dist/angulartics-ga.min.js",
    "/bower_components/ng-file-upload/ng-file-upload-shim.min.js",
    "/bower_components/ng-file-upload/ng-file-upload.min.js",
    "/bower_components/ng-img-crop/compile/unminified/ng-img-crop.js",
    '/bower_components/angular-i18n/angular-locale_es-es.js',
    "/bower_components/Chart.js/Chart.min.js",
    "/bower_components/angular-chart.js/dist/angular-chart.min.js",
    "/bower_components/angular-material-data-table/dist/md-data-table.min.js",
    "/bower_components/angular-rut/dist/angular-rut.js",
    "/bower_components/md-letter-avatar/md-letter-avatar.js",
    "/bower_components/fullcalendar/dist/fullcalendar.js",
    "/bower_components/angular-ui-calendar/src/calendar.js",
    "/bower_components/ngjs-color-picker/dist/ngjs-color-picker.js",
    "/bower_components/js-xlsx/dist/xlsx.full.min.js",
    "/bower_components/swiper/dist/js/swiper.js",
    "/bower_components/angular-swiper/dist/angular-swiper.js",
    "/bower_components/leaflet/dist/leaflet.js",
    "/bower_components/ment.io/dist/mentio.min.js",
    "/bower_components/ment.io/dist/templates.js",
    "/bower_components/angular-media-queries/match-media.js",
    "/bower_components/angular-bind-html-compile/angular-bind-html-compile.js",
    "/leaflet.iconlabel.js",
    "/bower_components/leaflet-draw/dist/leaflet.draw.js",
    "/leaflet.markercluster-src.js",
    "/Edit.Poly.js",
    "/bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.js",
    "/bower_components/pdfmake/build/pdfmake.min.js",
    "/bower_components/pdfmake/build/vfs_fonts.js",
    '/app.js',
    '/config/**/*.js'
];

var jsDashboardsFilesToInject = [
    "/views/dashboards/**/*.js",
    // Componentes globales
    '/components/**/*.js',
    '/factories/**/*.js',
    '/filters/**/*.js',
];

var jsLoginFilesToInject = [
    "/views/login/**/*.js",
    // Componentes globales
    '/components/**/*.js',
    '/factories/**/*.js',
    '/filters/**/*.js'
];

var jsPublicFilesToInject = [
    "/views/public/**/*.js",
    // Componentes globales
    '/components/**/*.js',
    '/factories/**/*.js',
    '/filters/**/*.js'
];
// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
    'templates/**/*.html'
];
module.exports.version = require('../package.json').version;
module.exports.productionPath = productionPath;
module.exports.builtPath = '.tmp/public';
//module.exports.builtPath = 'built/';
module.exports.productionCSS = module.exports.builtPath + '/prod/production.min.css';
module.exports.productionJS = module.exports.builtPath + '/prod/production.min.js';
module.exports.productionDashboardsJS = module.exports.builtPath + '/prod/production-dashboard.min.js';
module.exports.productionLoginJS = module.exports.builtPath + '/prod/production-login.min.js';
module.exports.productionPublicJS = module.exports.builtPath + '/prod/production-public.min.js';

// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(transformPath);
module.exports.jsFilesToInject = jsFilesToInject.map(transformPath);
module.exports.templateFilesToInject = templateFilesToInject.map(transformPath);
//custom
module.exports.jsDashboardsFilesToInject = jsDashboardsFilesToInject.map(transformPath);
module.exports.jsLoginFilesToInject = jsLoginFilesToInject.map(transformPath);
module.exports.jsPublicFilesToInject = jsPublicFilesToInject.map(transformPath);
// Transform paths relative to the "assets" folder to be relative to the public
// folder, preserving "exclude" operators.
function transformPath(path) {
    return (path.substring(0, 1) == '!') ? ('!' + tmpPath + path.substring(1)) : (tmpPath + path);
}