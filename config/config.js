angular.module('core.Config', ['ng'])
	.factory('CoreConfig', function($http, $q, $log) {
		
		var config = {
			url: '',
			data: undefined
		},
		data;

		function applyConfig(cfg) {
			angular.extend(config, cfg);
			if (config.data) {
				data = config.data;
			}
		}

		function init() {
			var d = $q.defer();
			if (data) {
				d.resolve(data);
			} else {
				if (config.url) {
					$http.get(config.url)
						.success(function(result) {
							if (typeof result == 'object') {
								data = result;
								d.resolve(data);							
							} else {
								d.reject('Конфиг не определен.');
							}
						})
						.error(function() {
							d.reject('Ошибка запроса');
						});
				} else {
					d.reject('url не определен.');
				}
			}
			return d.promise;
		}

		function get(key) {		
			if (key) {
				return data[key];
			} else {
				return data;
			}
		}

		return {
			config: function(cfg) {
				applyConfig(cfg);
				return this;
			},
			init: init,
			get: get
		}
	});