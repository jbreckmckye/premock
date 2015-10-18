'use strict';

const MaybeFunction = require('../src/MaybeFunction.js');

describe('MaybeFunction', ()=> {
	const mockImplementation = ()=> {};
	let maybeFunction;

	beforeEach(()=> {
		maybeFunction = new MaybeFunction();
	});

	it('has a getImplementation method', ()=> {
		expect(maybeFunction.getImplementation).toEqual(jasmine.any(Function));
	});

	it('has a resolveImplementation method', ()=> {
		expect(maybeFunction.resolveImplementation).toEqual(jasmine.any(Function));
	});

	it('resolveImplementation can take a function', ()=> {
		expect(()=> {
			maybeFunction.resolveImplementation(()=> {});
		}).not.toThrow();
	});

	it('before the implementation is resolved, getImplementation returns null', ()=> {
		expect(maybeFunction.getImplementation()).toEqual(null);
	});

	it('after the implementation is resolved, getImplementation returns the resolving function', ()=> {		
		maybeFunction.resolveImplementation(mockImplementation);
		expect(maybeFunction.getImplementation()).toBe(mockImplementation);
	});

	it('does not allow the resolved implementation to be overwritten', ()=> {
		const secondMockImplementation = ()=> {};
		maybeFunction.resolveImplementation(mockImplementation);
		maybeFunction.resolveImplementation(secondMockImplementation);
		expect(maybeFunction.getImplementation()).toBe(mockImplementation);
	});

});