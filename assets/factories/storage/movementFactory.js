(function () {
	'use strict';
	app.factory('movementFactory', FactoryController);

	/* @ngInject */
	function FactoryController($q) {
		var urlBase = '/storage/movement/';
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

			getAll: params => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getAll', params,
					data => {
						data.ok ? resolve(data) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),


			addDetail: movementDetail => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'addDetail', {
					movementDetail
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

			saveDetail: movementDetail => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'saveDetail', {
					movementDetail
				},
					data => {
						data.ok ? resolve(data) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),

			getAllDetail: params => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getAllDetail', params,
					data => {
						data.ok ? resolve(data) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),

			getExternalUnits: params => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'getExternalUnits', params,
					data => {
						data.ok ? resolve(data) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),

			create: movement => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'create', {
					movement
				},
					data => {
						data.ok ? resolve(data) : reject(data.obj)
						if (data.reload) {
							location.reload();
						}
					});
			}),

			update: movement => new Promise((resolve, reject) => {
				io.socket.post(urlBase + 'update', {
					movement
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


			unsubscribe: () => {
				io.socket.post(urlBase + 'unsubscribe', {},
					function (data) {
						console.log('unsubscribed');
						if (data.reload) {
							location.reload();
						}
					});
			}
		};
	}
})();
