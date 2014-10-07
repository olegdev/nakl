describe('nakl.Init', function() {	

	var NaklInit,
		$rootScope,
		$q;

	// mock module with initializer
	angular.module('service.TestService', [])
		.factory('TestService', function() {
			return {
				config: function(cfg) {
					this.cfg = cfg;
				},
				init: function() {
					var d = $q.defer();
					d.resolve();
					return d.promise;	
				}
			}
		});

	// mock module with failure initializer
	angular.module('TestService2', [])
		.factory('TestService2', function() {
			return {
				init: function() {
					var d = $q.defer();
					d.reject();
					return d.promise;	
				}
			}
		});

	// service with not deferred initializer
	angular.module('TestService3', [])
		.factory('TestService3', function() {
			return {
				init: function() {
					//
				}
			}
		});

	beforeEach(angular.mock.module('nakl.Init'));
	beforeEach(angular.mock.inject(function(_NaklInit_, _$rootScope_, _$q_) {
		NaklInit = _NaklInit_;
		$rootScope = _$rootScope_;
		$q = _$q_;
	}));
	
	it('Success initialization', function(done) {
		NaklInit
			.config({
				modules: 'service.TestService'
			})
			.run(function() {					
				expect(1).toBe(1);
				done();
			}, function(err) {
				expect(1).toBe(err);
				done();
			});
		$rootScope.$apply();
	});

	it('Failure initialization', function(done) {
		NaklInit
			.config({
				modules: 'TestService2'
			})
			.run(function() {					
				expect(1).toBe(2);
				done();
			}, function(err) {
				expect(1).toBe(1);
				done();
			});
		$rootScope.$apply();
	});

	it('Initialization with not deferred initalizer', function(done) {
		NaklInit
			.config({
				modules: 'TestService3'
			})
			.run(function() {					
				expect(1).toBe(1);
				done();
			}, function(err) {
				expect(1).toBe(err);
				done();
			});
		$rootScope.$apply();
	});

	it('Multiple initialization', function(done) {
		NaklInit
			.config({
				modules: ['service.TestService', 'service.TestService']
			})
			.run(function() {					
				expect(1).toBe(1);
				done();
			}, function(err) {
				expect(1).toBe(err);
				done();
			});

		$rootScope.$apply();
	});

	it('Initialization events', function(done) {
		NaklInit
			.config({
				modules: [{
					name: 'service.TestService',
					onInit: function() {
						done();
					}
				}]
			})			
			.run();
		$rootScope.$apply();
	});

	it('Config before init', function(done) {
		NaklInit
			.config({
				modules: [{
					name: 'service.TestService',
					config: {
						foo: 1
					},
					onInit: function(module) {
						if (module.cfg.foo == 1) {
							done();
						}
					}
				}]
			})			
			.run();
		$rootScope.$apply();
	});

});