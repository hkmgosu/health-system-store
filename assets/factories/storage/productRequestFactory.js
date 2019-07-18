(() => {
    'use strict';
    app.factory('productRequestFactory', ProductRequestFactory);

    function ProductRequestFactory() {
        var urlBase = '/storage/productRequest/';
        return {
            get: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'get', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getAll: params => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getAll', params,
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getComments: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getComments', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getDetailComments: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getDetailComments', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getReportPrint: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getReportPrint', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            create: productRequest => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'create', {
                        productRequest
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            update: productRequest => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'update', {
                        productRequest
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            delete: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delete', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),


            createComment: comment => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'createComment', {
                        comment
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            createDetailComment: comment => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'createDetailComment', {
                        comment
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getDetail: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getDetail', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            addDetail: detail => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addDetail', {
                        detail
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            updateDetail: detail => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'updateDetail', {
                        detail
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            delDetail: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delDetail', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            getShippings: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getShippings', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            addShipping: shipping => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'addShipping', {
                        shipping
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            updateShipping: shipping => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'updateShipping', {
                        shipping
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            delShipping: id => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'delShipping', {
                        id
                    },
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),

            unsubscribe: id => {
                io.socket.post(urlBase + 'unsubscribe', {
                    id: id
                }, function(data) {
                    if (data.reload) {
                        location.reload();
                    }
                });
            },

            unsubscribeDetail: id => {
                io.socket.post(urlBase + 'unsubscribeDetail', {
                    id: id
                }, function(data) {
                    if (data.reload) {
                        location.reload();
                    }
                });
            },

            getOriginUnits: () => new Promise((resolve, reject) => {
                io.socket.post(urlBase + 'getOriginUnits',
                    data => {
                        data.ok ? resolve(data) : reject(data.obj)
                        if (data.reload) {
                            location.reload();
                        }
                    });
            }),


        };
    }
})();