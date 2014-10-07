describe('core.Config', function() {

	var Config,
		$httpBackend;

	beforeEach(angular.mock.module('core.Config'));
	beforeEach(angular.mock.inject(function(_$httpBackend_, _CoreConfig_) {
		$httpBackend = _$httpBackend_;
		CoreConfig = _CoreConfig_;
	}));

	afterEach(function() {
    	$httpBackend.verifyNoOutstandingExpectation();
     	$httpBackend.verifyNoOutstandingRequest();
   	});

	it('Remote initialization', function() {
		$httpBackend
			.expectGET('/config_get.pl')
			.respond({user: {name: 'Oleg'}});
		CoreConfig
			.config({
				url: '/config_get.pl',
			})
			.init();
		$httpBackend.flush();
		expect(CoreConfig.get('user')).toEqual({name: 'Oleg'});
	});

	it('Static initialization', function() {		
		CoreConfig
			.config({
				data: {foo: 'bar'},
			})
			.init();		
		expect(CoreConfig.get('foo')).toEqual('bar');
	});
 	
});