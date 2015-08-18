describe('iconSelector', function () {

	beforeEach(module('iconSelector'));

	it('should do a proper decyclic search', inject(function (decyclicSearch) {
		var a = {
			b: 1,
			c: 'hey',
			d: ['ello', 'governer'],
			e: a,
			f: [{
				g: {
					h: [{}, {
						i: 'j'
					}]
				}
            }]
		};

		expect(decyclicSearch.search(a, 'hey').v).toEqual('hey');
		expect(decyclicSearch.search(a, 1).v).toEqual(1);
		expect(decyclicSearch.search(a, 'ello').v).toEqual('ello');
		var path = decyclicSearch.search(a, 'ello').p;
		expect(path).toBe('$["d"][0]');
		var components = path.trim('$').replace(/(\$\[|\])/g, '');
		expect(components).toEqual('"d"[0');
		components = components.split('[');
		expect(components[1]).toEqual('0');
		var val = a;
		for (var i in components) {
			val = val[JSON.parse(components[i])];
		}
		expect(val).toBe('ello');

		expect(decyclicSearch.search(a, 'j').p).toEqual('$["f"][0]["g"]["h"][1]["i"]');
	}));

	// TODO: write unit tests for the icon selector when it's properly implemented
});