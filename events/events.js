angular.module('core.Events', [])
	.factory('CoreEvents', function($rootScope) {
		
		var EventsProto = function(config) {
			this.prefix = config.prefix || '';
		}

		EventsProto.prototype.on = function(name, listener, scope) {
			scope = scope || $rootScope;
			scope.$on(prefixName(this.prefix, name), function() {				
				listener.apply(this, arguments[1]);
			});
		}

		EventsProto.prototype.trigger = function(name, args) {
			$rootScope.$broadcast(prefixName(this.prefix, name), args);
		}

		EventsProto.prototype.batchOn = function(batch, scope) {
			for(var i = 0; i < batch.length; i++) {
				this.on(batch[i].name, batch[i].fn, scope);
			}
		}

		function prefixName(prefix, name) {
			if(prefix) {
				return prefix + '-' + name;
			} else {
				return name;
			}
		}

		return {
			factory: function(config) {
				return new EventsProto(config);
			}
		}
	});