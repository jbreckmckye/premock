var foo = require('../src/foo.js');

describe('the foo', function() {
	it('Is a foo', function() {
		expect(foo()).toBe('I am the foo');
	}) 
})