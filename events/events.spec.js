describe('core.Events', function() {

	var CoreEvents;

	beforeEach(angular.mock.module('core.Events'));
	beforeEach(angular.mock.inject(function(_CoreEvents_) {
		CoreEvents = _CoreEvents_;
	}));

	it('Triggers and catches events', function() {
		var events = CoreEvents.factory({prefix: 'prefix'}),
			arg1 = 1,
			arg2 = 2;
		events.on('event', function(a1, a2) {
			expect(a1).toBe(arg1);
			expect(a2).toBe(arg2);
		});
		events.trigger('event', [arg1, arg2]);
	});

	it('Triggers and catches a batch', function(done) {
		var events = CoreEvents.factory({prefix: 'prefix'}),
			e1Catched;

		events.batchOn([{
			name: 'e1',
			fn: function() {
				e1Catched = true;
			}
		}, {
			name: 'e2',
			fn: function() {
				expect(e1Catched).toBe(true);
				done();
			}
		}]);

		events.trigger('e1');
		events.trigger('e2');
	});
 	
});