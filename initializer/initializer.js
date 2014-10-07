angular.module('nakl.Init', ['nakl.Events'])
	.factory('NaklInit', function($q, NaklEvents) {

		var events = NaklEvents.factory({prefix: 'nakl-initializer'}),
			modules = [];

		function config(cfg) {
			if (typeof cfg.modules == 'string') {
				modules = [cfg.modules];
			} else {
				modules = cfg.modules || [];
			}
		}

		function internalRun() {
			var d = $q.defer(),
				injector = angular.injector(modules),
				injectings = [];

			var decorateAsDeferred = function(obj) {
				if (obj && typeof obj.then == 'function') { // считаем что это deferred объект
					return obj;
				} else {
					return {
						then: function(fn) {
							fn();
						}
					}
				}
			}

			var getInjectingNameFor = function(module) {
				var parts;
				if (typeof module == 'object') {
					if (!module.name) {
						throw "Название модуля не задано";
					} else {
						parts = module.name.split('.');
					}
				} else {
					parts = module.split('.');
				}
				return parts[parts.length-1];
			}

			var fireEvent = function(eventName, moduleIndex) {
				events.trigger(modules[moduleIndex]+ '-' + eventName);
			}

			var invokeFn = function() {
				var moduleInstances = arguments,
					_runInitializers = function(moduleInstances, index, success, failure) {
						if (typeof moduleInstances[index]['init'] != 'function') {
							failure('Метод init не определен в модуле ' + injectings[index]);
							return;
						}
						try {
							decorateAsDeferred(moduleInstances[index]['init']())
								.then(function() {
									fireEvent('init', index);
									if (++index < moduleInstances.length) {
										_runInitializers(moduleInstances, index, success, failure);
									} else {
										success();
									}
								}, function(error) {
									failure(index, error);
								});
						} catch(e) {
							failure(index, e.message);
						}
					}
				if (moduleInstances.length) {
					_runInitializers(moduleInstances, 0, function() {
						d.resolve();
					}, function(index, err) {
						d.reject('Ошибка при вызове инициализатора ' + injectings[index] + ': ' + err);		
					});
				} else {
					d.resolve();
				}
			}			

			for(var i = 0; i < modules.length; i++) {
				injectings.push(getInjectingNameFor(modules[i]));
			}
			injectings.push(invokeFn);

			try {
				injector.invoke(injectings);
			} catch(e) {
				d.reject('Ошибка при подключении модулей: ' + e.message);
			}

			return d.promise;
		}

		return {
			config: function(cfg) {
				config(cfg);
				return this;
			},
			run: function(success, failure) {
				internalRun()
					.then(function() {
						if (success) {
							success.apply(this, arguments);
						}
					}, function() {
						if (failure) {
							failure.apply(this, arguments);
						}
					});
				return this;
			},
			eventsOn: function() {
				if (typeof arguments[0] == 'string') {
					events.on.apply(events, arguments);
				} else {
					events.batchOn.apply(events, arguments);
				}
				return this;
			}

		}
	});