(() => {
	'use strict';
	app.factory('productFactory', ProductFactory);

	function ProductFactory() {
		var urlBase = '/storage/product/';
		return {
			get: id => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'get', {
					id
				},
					data => {
						data.ok ? resolve(data.obj) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),
			getAll: params => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getAll', params,
					data => {
						data.ok ? resolve(data.obj) : reject(data.obj)
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
			create: product => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'create', {
					product
				},
					data => {
						data.ok ? resolve(data) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),
			save: product => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'update', {
					product
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
			getLogs: id => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getLogs', {
					id
				},
					data => {
						data.ok ? resolve(data.obj) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),
			getParams: () => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getParams', data => {
					data.ok ? resolve(data.obj) : reject();
					if (data.reload) {
						location.reload();
					}
				});
			}),
			getStockParameters: id => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getStockParameters', {
					id
				}, data => {
					data.ok ? resolve(data.obj) : reject();
					if (data.reload) {
						location.reload();
					}
				});
			}),
			saveStockParameter: stockParameter => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'saveStockParameter', {
					stockParameter
				}, data => {
					data.ok ? resolve(data) : reject(data);
					if (data.reload) {
						location.reload();
					}
				});
			}),
			removeStockParameter: id => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'removeStockParameter', {
					id
				},
					data => {
						data.ok ? resolve(data) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),
			deleteProductProfilePicture: idProduct => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'deleteProductProfilePicture', {
					idProduct
				}, data => {
					data.ok ? resolve() : reject();
					if (data.reload) {
						location.reload();
					}
				});
			}),
			getAllowedProducts: params => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getAllowedProducts', params,
					data => {
						data.ok ? resolve(data.obj) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),
			getPacks: filter => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getPacks', filter, data => {
					data.ok ? resolve(data.obj) : reject(data.obj);
					if (data.reload) {
						location.reload();
					}
				});
			}),
			getPackTypes: params => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getPackTypes', params, data => {
					data.ok ? resolve(data.obj) : reject(data.obj);
					if (data.reload) {
						location.reload();
					}
				});
			}),
			savePack: productPack => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'savePack', {
					productPack
				}, data => {
					data.ok ? resolve(data.obj) : reject(data.obj);
					if (data.reload) {
						location.reload();
					}
				});
			}),
			removePack: pack => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'removePack', pack,
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

			unsubscribe: id => {
				io.socket.post(urlBase + 'unsubscribe', {
					id: id
				}, function (data) {
					console.log('unsubscribed');
					if (data.reload) {
						location.reload();
					}
				});
			},

			getLots: params => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getLots', params,
					data => {
						data.ok ? resolve(data.obj) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),

			getStocks: params => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getStocks', params,
					data => {
						data.ok ? resolve(data.obj) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),

			validateProductCode: productCode => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'validateProductCode', {
					productCode
				},
					data => {
						data.ok ? resolve(data.obj) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),

			getProductActiveComponents: filter => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getProductActiveComponents', filter, data => {
					data.ok ? resolve(data.obj) : reject(data.obj);
					if (data.reload) {
						location.reload();
					}
				});
			}),
			saveProductActiveComponent: productActiveComponent => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'saveProductActiveComponent', {
					productActiveComponent
				}, data => {
					data.ok ? resolve(data.obj) : reject(data.obj);
					if (data.reload) {
						location.reload();
					}
				});
			}),
			removeProductActiveComponent: productActiveComponent => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'removeProductActiveComponent', productActiveComponent,
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
