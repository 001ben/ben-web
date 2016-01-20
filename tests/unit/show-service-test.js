describe('Show Services', function () {

	describe('Debouncer', function() {

		beforeEach(module('shows'));

		it('should trigger a callback after an interval', inject(function(debouncer, $interval) {
			var called = false;

			debouncer.start(function() {
				called = true;
			});

			$interval.flush(1000);
			expect(called).toBe(true);
		}));

		it('should not trigger a callback if clear was run', inject(function(debouncer, $interval) {
			var called = false;

			debouncer.start(function() {
				called = true;
			});
			debouncer.clear();

			$interval.flush(1000);
			expect(called).toBe(false);
		}));

		it('should not trigger any current callbacks if start is called again', inject(function(debouncer, $interval) {
			var called1 = false;
			var called2 = false

			debouncer.start(function() {
				called1 = true;
			});
			debouncer.start(function() {
				called2 = true;
			});

			$interval.flush(1000);
			expect(called1).toBe(false);
			expect(called2).toBe(true);
		}));
	});
});
