self.addEventListener('push', function (event) {
    event.waitUntil(
        self.registration.showNotification('Mi SSVQ', {
            body: 'Puede que tengas nuevas notificaciones',
            icon: 'assets/images/icons/icon-192x192.png',
            tag: 'my-tag'
        })
    );
});