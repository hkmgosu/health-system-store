(() => {
    'use strict';
    app.factory('maintainersFactory', MaintainersFactory);

    function MaintainersFactory() {
        var urlBase = '/storage/maintainers/';
        return {
            getModules: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getModules', null,
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            })
        };
    }
})();