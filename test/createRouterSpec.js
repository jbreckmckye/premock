'use strict';

const createRouter = require('../src/createRouter.js');
const LaterFunction = require('../src/LaterFunction.js');

describe('createRouter', ()=> {
	
	describe('The proxy factory', ()=> {
		it('Returns a function', ()=> {
			expect(createRouter()).toEqual(jasmine.any(Function));
		});
	});

	describe('The router function', ()=> {
		let mockImplementation, mockCallStore, laterFunction, proxy;

		beforeEach(()=> {
			laterFunction = new LaterFunction();
			mockCallStore = {
				record : jasmine.createSpy('mockCallStore.record')
			};
			createRouter._Promise = window.Promise;
		});

		it('Returns undefined if it cannot use Promises', ()=> {
			createRouter._Promise = undefined;

			proxy = createRouter(laterFunction, mockCallStore);
			expect(proxy()).toBeUndefined();
		});

		it('Returns a promise if it can use Promises', ()=> {
			function MockPromise() {}
			createRouter._Promise = MockPromise;

			proxy = createRouter(laterFunction, mockCallStore);
			expect(proxy()).toEqual(jasmine.any(MockPromise));
		});

		describe('When the implementation does not yet exist', ()=> {
			beforeEach(()=> {
				laterFunction = new LaterFunction();
				proxy = createRouter(laterFunction, mockCallStore);
			});

			it('the proxy records a call with the call store', ()=> {
				proxy();
				expect(mockCallStore.record).toHaveBeenCalled();
			});

			it('call arguments are passed to the store as the first record argument', ()=> {
				proxy(123, 456);
				const recordArgs = mockCallStore.record.calls.mostRecent().args;

				expect(recordArgs[0]).toEqual([123, 456]);
			});

			it('passes the "this" binding of the call as the second record argument', ()=> {
				const mockThis = {identifier: 123};
				const boundProxy = proxy.bind(mockThis);
				boundProxy();
				const recordArgs = mockCallStore.record.calls.mostRecent().args;

				expect(recordArgs[1]).toBe(mockThis);
			});

			it('a resolver for the returned promise is passed as the third argument', (done)=> {
				const callPromise = proxy();
				const recordArgs = mockCallStore.record.calls.mostRecent().args;
				const resolver = recordArgs[2];

				expect(resolver).toEqual(jasmine.any(Function));

				callPromise.then(done); // lets us fail the test if the promise doesn't get resolved
				resolver();
			});
		});

		describe('When the implementation does exist', ()=> {
			beforeEach(()=> {
				laterFunction = new LaterFunction();
				mockImplementation = jasmine.createSpy('mockImplementation');
				laterFunction.resolve(mockImplementation);
				proxy = createRouter(laterFunction, mockCallStore);
			});

			it('calls that implementation', ()=> {
				proxy();
				expect(mockImplementation).toHaveBeenCalled();
			});

			it('passes on its arguments', ()=> {
				proxy(123, 456);
				expect(mockImplementation).toHaveBeenCalledWith(123, 456);
			});

			it('passes on the "this" binding', ()=> {
				const mockThis = {};
				const boundProxy = proxy.bind(mockThis);
				boundProxy();
				const passedThisValue = mockImplementation.calls.mostRecent().object;
				expect(passedThisValue).toBe(mockThis);
			});

			it('does not swallow exceptions', ()=> {
				mockImplementation.and.throwError('Mock error string');
				const callBrokenImplementation = ()=> {proxy()};
				expect(callBrokenImplementation).toThrowError('Mock error string');
			});

			it('resolves the returned promise immediately', (done)=> {
				const callPromise = proxy();
				callPromise.then(done); // fails test if not called
			}, 50);

			it('the promise is resolved with the return value of the call', (done)=> {
				mockImplementation.and.returnValue('foo');
				const callPromise = proxy();
				callPromise.then(function(resolvedValue){
					expect(resolvedValue).toBe('foo');
					done();
				});
			});
		});
	});
});
