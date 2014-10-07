angular.module('nakl.Init', ['nakl.Events'])
	.factory('NaklInit', function($q, NaklEvents) {

		var events = NaklEvents.factory({prefix: 'nakl-initializer'}),
			modules = [];

		function applyConfig(cfg) {
			if (typeof cfg.modules == 'string') {
				modules = [cfg.modules];
			} else {
				modules = cfg.modules || [];
			}
		}

		function internalRun() {
			var d = $q.defer(),		
				moduleNames = [],		
				moduleProviders = [],
				module, injector, i;

			var normalizeModule = function(module) {
				if (typeof module == 'string') {
					return {
						name: module
					};
				} else {
					return module;
				}
			}

			var getProviderName = function(module) {
				var parts, name = '', i;
				if (!module.provider) {
					 parts = module.name.split('.');
					 for(i = 0; i < parts.length; i++) {
					 	name += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
					 }
					 return name;
				} else {
					return module.provider;
				}				
			}

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

			var invokeFn = function() {
				var moduleInstances = arguments,
					_runInitializers = function(moduleInstances, index, success, failure) {
						// config invoke
						if (modules[index].config && typeof moduleInstances[index]['config'] == 'function') {
							try {
								moduleInstances[index]['config'](modules[index].config);
							} catch(e) {
								failure(index, e.message);
							}
						}
						// init invoke
						if (typeof moduleInstances[index]['init'] == 'function') {
							try {
								decorateAsDeferred(moduleInstances[index]['init']())
									.then(function() {
										if (typeof modules[index].onInit == 'function') {
											modules[index].onInit(moduleInstances[index]);
										}
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
						} else {
							failure(index, 'Метод init не определен в модуле ' + modules[index]);
							return;
						}
					}
				if (moduleInstances.length) {
					_runInitializers(moduleInstances, 0, function() {
						d.resolve();
					}, function(index, err) {
						d.reject('Ошибка при вызове инициализатора модуля' + modules[index] + ': ' + err);
					});
				} else {
					d.resolve();
				}
			}			

			for(i = 0; i < modules.length; i++) {
				modules[i] = normalizeModule(modules[i]);
				moduleNames.push(modules[i].name);
				moduleProviders.push(getProviderName(modules[i]));
			}

			moduleProviders.push(invokeFn);

			injector = angular.injector(moduleNames);
			try {
				injector.invoke(moduleProviders);
			} catch(e) {
				d.reject('Ошибка при подключении модулей: ' + e.message);
			}

			return d.promise;
		}

		return {
			config: function(cfg) {
				applyConfig(cfg);
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
			}
		}
	});