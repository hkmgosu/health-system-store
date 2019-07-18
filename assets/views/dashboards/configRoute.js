(function () {
    'use strict';
    app.config(moduleConfig);
    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider, $urlRouterProvider, $mdDateLocaleProvider, localStorageServiceProvider, $provide) {
        $translatePartialLoaderProvider.addPart('dashboards');
        var menu = [];
        var isFirst = true;
        var defaultUrl = '';
        var drawMenu = function (modules, children) {
            _.map(modules, function (module, keyModule) {
                if (_.some(module.config.privileges)) {
                    let tempMenu = {};
                    if (module.config.menu) {
                        tempMenu = {
                            name: module.name || '',
                            icon: module.config.menu.icon || '',
                            priority: module.config.menu.priority
                        };
                        if (module.config.menu.state) {
                            if (isFirst && !module.config.menu.hidden && !module.config.menu.intranet) {
                                defaultUrl = module.config.menu.url;
                                isFirst = false;
                            }
                            if (module.config.menu.intranet) {
                                //                            debugger;
                                if (_.isUndefined(window.INTRANET))
                                    return;
                            }
                            $stateProvider.state(module.config.menu.state, {
                                url: module.config.menu.url,
                                templateUrl: module.config.menu.templateUrl,
                                template: module.config.menu.template,
                                params: module.config.menu.params,
                                controller: module.config.menu.controller,
                                controllerAs: 'vm',
                                data: _.extend({
                                    privileges: module.config.privileges
                                }, module.config.menu.data)
                            });
                            tempMenu.type = 'link';
                            tempMenu.state = module.config.menu.state;
                            tempMenu.hidden = module.config.menu.hidden;
                            if (children) {
                                children.push(tempMenu);
                            } else {
                                menu.push(tempMenu);
                            }
                        } else {
                            tempMenu.type = 'dropdown';
                            tempMenu.children = [];
                            menu.push(tempMenu);
                        }
                    }
                    if (module.modules) {
                        drawMenu(module.modules, tempMenu.children || []);
                    }
                }
            });
        };

        drawMenu(_.orderBy(modulesPrivileges.modules, 'config.menu.priority'));
        _.each(menu, function (m) {
            triMenuProvider.addMenu(m);
        });

        $urlRouterProvider.when('', defaultUrl);
        $urlRouterProvider.when('/', defaultUrl);

        // always goto 404 if route not found
        $urlRouterProvider.otherwise(defaultUrl);

        $mdDateLocaleProvider.formatDate = function (date) {
            if (date) {
                return moment.utc(date).format('DD/MM/YYYY');
            } else {
                return null;
            }
        };

        $mdDateLocaleProvider.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        $mdDateLocaleProvider.shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        $mdDateLocaleProvider.days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'];
        $mdDateLocaleProvider.shortDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

        $mdDateLocaleProvider.firstDayOfWeek = 1;

        $mdDateLocaleProvider.msgCalendar = 'Calendario';
        $mdDateLocaleProvider.msgOpenCalendar = 'Abrir calendario';

        localStorageServiceProvider
            .setPrefix('miSSVQ');
    }
})();