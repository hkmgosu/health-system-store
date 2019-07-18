(function () {
    'use strict';
    /**
     * Example
     * <ssvq-dashboards-notification-sidebar></ssvq-dashboards-notification-sidebar>
     */
    app.directive('ssvqDashboardsNotificationSidebar', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/dashboards/dashboardsNotificationSidebar/dashboardsNotificationSidebar.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $rootScope, $mdSidenav, $mdDialog, $mdToast, $location) {
        var vm = this;
        // sets the current active tab
        vm.close = close;
        vm.notificationList = [];
        vm.count = 0;
        vm.paginate = { page: 0, limit: 15 };

        $scope.$watch(() => vm.count, count => {
            $rootScope.$broadcast('notifications', {
                cant: count
            });
        });

        var getLink = notification => {
            switch (notification.modelModule) {
                case 'request':
                    return 'solicitudes/detalles/' + notification.idModelModule;
                case 'derivation':
                    return 'derivaciones/detalles/' + notification.idModelModule;
                case 'adverseEvent':
                    return 'eventos-adversos/detalles/' + notification.idModelModule;
                case 'permission':
                    return 'permisos/detalles/' + notification.idModelModule;
                case 'viatic':
                    return 'viaticos/detalles/' + notification.idModelModule;
            };
        };

        var showToast = notification => {
            $mdToast.show({
                template: '<md-toast>' +
                    '<div class="md-toast-content">' +
                    '<span>' + notification.title + '</span>' +
                    '</div>' +
                    '</md-toast>'
            });
            var audio = new Audio('/assets/sounds/notification.mp3');
            audio.play();
        };

        var showPushNotification = (title, link) => {
            if ('Notification' in window && Notification.permission === "granted") {
                var ntf = new Notification('Mi SSVQ', {
                    body: title.replace(/<.[^>]*>/g, ''),
                    icon: 'assets/images/icons/icon-192x192.png',
                    tag: 'my-tag'
                });
                if (link) {
                    ntf.onclick = function (event) {
                        window.open('#/' + link, '_blank');
                    };
                }
            }
        };

        var onSocket = function (msg) {
            var data = msg.data;
            let notification;
            switch (data.type) {
                case 'notificationGroup.new':
                    notification = data.data;
                    vm.notificationList.unshift(notification);
                    vm.count++;
                    showToast(notification);
                    showPushNotification(notification.title, getLink(notification));
                    break;
                case 'notificationGroup.update':
                    notification = _.find(vm.notificationList, {
                        id: data.data.id
                    });
                    if (notification) {
                        if (notification.lastCreatedAt != data.data.lastCreatedAt && notification.count < data.data.count) {
                            notification.title = data.data.title;
                            showToast(notification);
                            showPushNotification(notification.title, getLink(notification));
                            notification.lastCreatedAt = data.data.lastCreatedAt;
                            notification.count = data.data.count;
                        }
                        notification.groupHidden = true;
                        notification.groupedNotifications = undefined;
                        if (!notification.read && data.data.read) {
                            vm.count--;
                        } else if (notification.read && !data.data.read) {
                            vm.count++;
                        }
                        notification.read = data.data.read;
                    }
                    break;
            }
        };

        $scope.markAllAsReaded = () => {
            io.socket.post('/notification/markAllAsReaded', (data) => {
                if (data.ok) {
                    vm.notificationList.forEach(n => n.read = true);
                    vm.count = 0;
                } else {
                    console.error('/notification/markAllAsReaded');
                }
            });
        };

        vm.nextPage = () => new Promise((resolve, reject) => {
            // Se actualiza la página a solicitar
            vm.paginate.page++;
            // Se inicia solicitud a backend
            io.socket.post('/notification/getMine', { paginate: vm.paginate }, data => {
                if (data.ok) {
                    vm.notificationList = _.concat(vm.notificationList, data.obj.list || []);
                    vm.count = data.obj.unreadCount;
                    $scope.$apply();
                    resolve();
                } else {
                    vm.notificationList = [];
                    reject();
                }
            });
        });

        vm.nextPage().then(() => { }).catch(() => { });

        io.socket.post('/notification/subscribe', function (socketData) {
            console.info(socketData);
        });

        io.socket.on('employee', onSocket);

        $scope.$on("$destroy", function () {
            io.socket.off('employee', onSocket);
        });

        function close() {
            $mdSidenav('notifications').close();
        }
    }
})();