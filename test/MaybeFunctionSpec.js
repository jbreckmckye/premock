'use strict';

const MaybeFunction = require('../src/MaybeFunction.js');

describe('MaybeFunction', ()=> {
	const mockImplementation = ()=> {};
	let maybeFunction, mockOnResolve;

	beforeEach(()=> {
		mockOnResolve = jasmine.createSpy('mockOnResolve');
		maybeFunction = new MaybeFunction(mockOnResolve);
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
	})

	it('before the implementation is resolved, getImplementation returns null', ()=> {
		expect(maybeFunction.getImplementation()).toEqual(null);
	});

	it('after the implementation is resolved, getImplementation returns it', ()=> {		
		maybeFunction.resolveImplementation(mockImplementation);
		expect(maybeFunction.getImplementation()).toBe(mockImplementation);
	});

	it('when the implementation is resolved, the onResolve callback is invoked', ()=> {
		maybeFunction.resolveImplementation(mockImplementation);
		expect(mockOnResolve).toHaveBeenCalled();
	});
});