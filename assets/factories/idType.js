(function () {
    'use strict';
    app.factory('idTypeFactory', IdTypeController);

    function IdTypeController() {
        var idType = [
            { name: 'IDTYPE.RUT', value: 'rut' },
            { name: 'IDTYPE.PASSPORT', value: 'passport' },
            { name: 'IDTYPE.NN', value: 'nn' }
        ];
        return {
            get: () => {
                return idType;
            }
        };
    }
})();