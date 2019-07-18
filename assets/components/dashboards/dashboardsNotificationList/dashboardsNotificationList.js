(() => {
    'use strict';
    /**
     * Example
     * <ssvq-dashboards-notification-list></ssvq-dashboards-notification-list>
     */
    app.directive('ssvqDashboardsNotificationList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                notificationList: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/dashboards/dashboardsNotificationList/dashboardsNotificationList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $location, $mdSidenav) {
        var vm = this;
        vm.getIcon = type => {
            switch (type) {
                case 'request':
                    return 'zmdi zmdi-ticket-star';
                case 'derivation':
                    return 'fa fa-exchange';
                case 'adverseEvent':
                    return 'zmdi zmdi-receipt';
                case 'permission':
                    return 'zmdi zmdi-calendar-check';
                case 'viatic':
                    return 'zmdi zmdi-flight-takeoff';
                case 'rem':
                    return 'zmdi zmdi-hospital';
                default:
                    return 'zmdi zmdi-info';
            }
        };

        vm.onNotificationClick = notification => {
            if (!notification.read) {
                vm.toggleReaded(notification);
            }
            switch (notification.modelModule) {
                case 'request':
                    $location.path('solicitudes/detalles/' + notification.idModelModule);
                    break;
                case 'derivation':
                    $location.path('derivaciones/detalles/' + notification.idModelModule);
                    break;
                case 'adverseEvent':
                    $location.path('eventos-adversos/detalles/' + notification.idModelModule);
                    break;
                case 'permission':
                    $location.path('permisos/detalles/' + notification.idModelModule);
                    break;
                case 'viatic':
                    $location.path('viaticos/detalles/' + notification.idModelModule);
                    break;
                case 'rem':
                    $location.path('samu/incidentes/' + notification.idModelModule);
                    break;
            }
            $mdSidenav('notifications').close();
        };

        vm.toggleReaded = notification => {
            io.socket.post('/notification/toggleReaded', {
                notification: notification
            }, () => { });
        };

        vm.markAllAsReaded = () => {
            io.socket.post('/notification/markAllAsReaded', (data) => {
                if (data.ok) {
                    vm.notificationList.forEach(n => n.read = true);
                    vm.count = 0;
                } else {
                    console.error('/notification/markAllAsReaded');
                }
            });
        };

        vm.getGroup = group => {
            if (group.groupedNotifications) {
                group.groupHidden = !group.groupHidden;
                return;
            }
            group.groupHidden = true;
            io.socket.post('/notification/getGroup', { groupId: group.id }, data => {
                if (data.ok) {
                    group.groupHidden = false;
                    group.groupedNotifications = data.obj;
                    $scope.$apply();
                }
            }, err => {
                console.log(err);
            })
        };
    }
})();