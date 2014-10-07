angular.module('service.Ping', ['ng', 'nakl.Events'])
	.factory('Ping', function($http, $log, NaklEvents) {

		var events = NaklEvents.factory({prefix: 'ping'}),
			config = {
				period: 60,
				url: ''
			},
			taskId;

		function applyConfig(cfg) {
			angular.extend(config, cfg);
		}

		function init() {
			if (!taskId) {
				taskId = setInterval(ping, config.period*1000);
			}
		}

		function ping(callback) {
			$http.get(config.url)
				.success(function(result) {
					if (callback) {
						callback(result);
					}
					events.trigger('ping', [result]);
				});
		}

		return {
			config: function(cfg) {
				applyConfig(cfg);
				return this;
			},
			init: function() {
				init();
			},
			ping: function(callback) {
				ping(callback);
			},
			eventsOn: function(/* events.on or events.batchOn arguments */) {
				if (typeof arguments[0] == 'string') {
					events.on.apply(events, arguments);
				} else {
					events.batchOn.apply(events, arguments);
				}
				return this;
			}
		}

	});