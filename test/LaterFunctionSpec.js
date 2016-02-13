'use strict';

const LaterFunction = require('../src/LaterFunction.js');

describe('MaybeLaterFunction', ()=> {
	const mockImplementation = ()=> {};
	let laterFunction;

	beforeEach(()=> {
		laterFunction = new LaterFunction();
	});

	it('has a getImplementation method', ()=> {
		expect(laterFunction.getImplementation).toEqual(jasmine.any(Function));
	});

	it('has a resolve method', ()=> {
		expect(laterFunction.resolve).toEqual(jasmine.any(Function));
	});

	it('resolve can take a function', ()=> {
		expect(()=> {
			laterFunction.resolve(()=> {});
		}).not.toThrow();
	});

	it('before the implementation is resolved, getImplementation returns null', ()=> {
		expect(laterFunction.getImplementation()).toEqual(null);
	});

    it('before the implementation is resolved, existsYet equals false', ()=> {
        expect(laterFunction.existsYet).toEqual(false);
    });

	it('after the implementation is resolved, getImplementation returns the resolving function', ()=> {		
		laterFunction.resolve(mockImplementation);
		expect(laterFunction.getImplementation()).toBe(mockImplementation);
	});

    it('after the implementation is resolved, existsYet equals true', ()=> {
        laterFunction.resolve(mockImplementation);
        expect(laterFunction.existsYet).toBe(true);
    });

	it('does not allow the resolved implementation to be overwritten', ()=> {
		const secondMockImplementation = ()=> {};
		laterFunction.resolve(mockImplementation);
		laterFunction.resolve(secondMockImplementation);
		expect(laterFunction.getImplementation()).toBe(mockImplementation);
	});

});