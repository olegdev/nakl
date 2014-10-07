describe('service.Ping', function() {

	var Ping,
		$httpBackend;

	beforeEach(angular.mock.module('service.Ping'));
	beforeEach(angular.mock.inject(function(_$httpBackend_, _Ping_) {
		$httpBackend = _$httpBackend_;
		Ping = _Ping_;
	}));

	it('Starts ping server on demand', function() {
		$httpBackend.expectGET('/ping_cmd.pl').respond(200);
		Ping.config({url: '/ping_cmd.pl'}).ping();
		$httpBackend.flush();
	});

	it('Fires ping event', function(done) {
		$httpBackend.expectGET('/ping_cmd.pl').respond(200);
		Ping
			.config({url: '/ping_cmd.pl'})
			.eventsOn('ping', function() {
				done();
			})
			.ping();
		$httpBackend.flush();
	});

	it('Starts ping server on init', function(done) {
		$httpBackend.expectGET('/ping_cmd.pl').respond(200);		
		Ping
			.config({
				url: '/ping_cmd.pl',
				period: 0
			})
			.eventsOn('ping', function() {
				done();
			})
			.init();		
		setTimeout(function() {
			$httpBackend.flush();
		}, 0);
	});

});