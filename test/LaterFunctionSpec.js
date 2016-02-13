'use strict';

const LaterFunction = require('../src/LaterFunction.js');

describe('MaybeFunction', ()=> {
	const mockImplementation = ()=> {};
	let maybeFunction;

	beforeEach(()=> {
		maybeFunction = new LaterFunction();
	});

	it('has a getImplementation method', ()=> {
		expect(maybeFunction.getImplementation).toEqual(jasmine.any(Function));
	});

	it('has a resolve method', ()=> {
		expect(maybeFunction.resolve).toEqual(jasmine.any(Function));
	});

	it('resolve can take a function', ()=> {
		expect(()=> {
			maybeFunction.resolve(()=> {});
		}).not.toThrow();
	});

	it('before the implementation is resolved, getImplementation returns null', ()=> {
		expect(maybeFunction.getImplementation()).toEqual(null);
	});

	it('after the implementation is resolved, getImplementation returns the resolving function', ()=> {		
		maybeFunction.resolve(mockImplementation);
		expect(maybeFunction.getImplementation()).toBe(mockImplementation);
	});

	it('does not allow the resolved implementation to be overwritten', ()=> {
		const secondMockImplementation = ()=> {};
		maybeFunction.resolve(mockImplementation);
		maybeFunction.resolve(secondMockImplementation);
		expect(maybeFunction.getImplementation()).toBe(mockImplementation);
	});

});