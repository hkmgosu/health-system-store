(function() {
    'use strict';
    app.factory('storageReportFactory', StorageReportFactory);

    function StorageReportFactory($q) {
        var urlBase = '/storage/storageReport/';
        return {
            getProductMostRequested: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getProductMostRequested', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getStockExpiration: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getStockExpiration', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getStockLot: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getStockLot', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getCriticalStock: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getCriticalStock', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getInputOutputProduct: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getInputOutputProduct', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getProductRequest: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getProductRequest', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getMaxStock: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getMaxStock', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getWeightedPrice: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getWeightedPrice', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getProducts: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getProducts', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getPurchasesFromSuppliers: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getPurchasesFromSuppliers', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getBincard: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getBincard', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getExpensePerUnit: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getExpensePerUnit', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getCenabast: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getCenabast', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            },
            getConsolidatedProducts: filter => {
                var deferred = $q.defer();
                io.socket.post(urlBase + 'getConsolidatedProducts', filter, function(data) {
                    data.ok ? deferred.resolve(data.obj) : deferred.reject();
                    if (data.reload) {
                        location.reload();
                    }
                });
                return deferred.promise;
            }
        };
    }

})();