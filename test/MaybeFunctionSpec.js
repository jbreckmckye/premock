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

	it('has a setImplementation method', ()=> {
		expect(maybeFunction.setImplementation).toEqual(jasmine.any(Function));
	});

	it('setImplementation can take a function', ()=> {
		expect(()=> {
			maybeFunction.setImplementation(()=> {});
		}).not.toThrow();
	});

	it('before the implementation is resolved, getImplementation returns null', ()=> {
		expect(maybeFunction.getImplementation()).toEqual(null);
	});

	it('after the implementation is resolved, getImplementation returns the resolving function', ()=> {		
		maybeFunction.setImplementation(mockImplementation);
		expect(maybeFunction.getImplementation()).toBe(mockImplementation);
	});

	it('does not allow the resolved implementation to be overwritten', ()=> {
		const secondMockImplementation = ()=> {};
		maybeFunction.setImplementation(mockImplementation);
		maybeFunction.setImplementation(secondMockImplementation);
		expect(maybeFunction.getImplementation()).toBe(mockImplementation);
	});

});