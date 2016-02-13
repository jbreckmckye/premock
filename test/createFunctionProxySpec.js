'use strict';

const createFunctionProxy = require('../src/createFunctionProxy.js');

describe('createFunctionProxy', ()=> {
	
	describe('The proxy factory', ()=> {
		it('Returns a function', ()=> {
			expect(createFunctionProxy()).toEqual(jasmine.any(Function));
		});
	});

	describe('The proxy function', ()=> {
		let mockImplementation, mockCallStore, mockGetImplementation, proxy;

		beforeEach(()=> {
			mockGetImplementation = ()=> {return mockImplementation};
			mockCallStore = {
				record : jasmine.createSpy('mockCallStore.record')
			};
			createFunctionProxy._Promise = window.Promise;		
		});

		it('Returns undefined if it cannot use Promises', ()=> {
			createFunctionProxy._Promise = undefined;

			proxy = createFunctionProxy(mockGetImplementation, mockCallStore);
			expect(proxy()).toBeUndefined();
		});

		it('Returns a promise if it can use Promises', ()=> {
			function MockPromise() {}
			createFunctionProxy._Promise = MockPromise;

			proxy = createFunctionProxy(mockGetImplementation, mockCallStore);
			expect(proxy()).toEqual(jasmine.any(MockPromise));
		});

		describe('When the implementation does not yet exist', ()=> {
			beforeEach(()=> {
				mockImplementation = null;
				proxy = createFunctionProxy(mockGetImplementation, mockCallStore);
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
				const mockThis = {};
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
				mockImplementation = jasmine.createSpy('mockImplementation');
				proxy = createFunctionProxy(mockGetImplementation, mockCallStore);
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
				mockImplementation = ()=> {
					throw new Error('Mock error string');
				};
				const callBrokenImplementation = ()=> {proxy()};
				expect(callBrokenImplementation).toThrowError('Mock error string');
			});

			it('resolves the returned promise immediately', (done)=> {
				const callPromise = proxy();
				callPromise.then(done); // fails test if not called
			}, 50);

			it('the promise is resolved with the return value of the call', (done)=> {
				mockImplementation = ()=> {
					return 'foo'
				};
				const callPromise = proxy();
				callPromise.then(function(resolvedValue){
					expect(resolvedValue).toBe('foo');
					done();
				});
			});
		});
	});
});
