'use strict';

const createProxy = require('../src/createProxy.js');

describe('createProxy', ()=> {
	
	describe('The proxy factory', ()=> {
		it('Returns a function', ()=> {
			expect(createProxy()).toEqual(jasmine.any(Function));
		});
	});

	describe('The proxy function', ()=> {
		let mockImplementation, mockCallStore, mockGetImplementation, proxy;

		beforeEach(()=> {
			mockGetImplementation = ()=> {return mockImplementation};
			mockCallStore = {
				record : jasmine.createSpy('mockCallStore.record')
			};
			createProxy._Promise = window.Promise;		
		});

		it('Returns undefined if it cannot use Promises', ()=> {
			createProxy._Promise = undefined;

			proxy = createProxy(mockGetImplementation, mockCallStore);
			expect(proxy()).toBeUndefined();
		});

		it('Returns a promise if it can use Promises', ()=> {
			function MockPromise() {}
			createProxy._Promise = MockPromise;

			proxy = createProxy(mockGetImplementation, mockCallStore);
			expect(proxy()).toEqual(jasmine.any(MockPromise));
		});

		describe('When the implementation does not yet exist', ()=> {
			beforeEach(()=> {
				mockImplementation = null;
				proxy = createProxy(mockGetImplementation, mockCallStore);
			});

			it('the proxy records a call with the call store', ()=> {
				proxy();
				expect(mockCallStore.record).toHaveBeenCalled();
			});

			it('passes the "this" binding of the call as the first record argument', ()=> {
				const mockThis = {};
				const boundProxy = proxy.bind(mockThis);
				boundProxy();
				const recordArgs = mockCallStore.record.calls.mostRecent().args;

				expect(recordArgs[0]).toBe(mockThis);
			});

			it('call arguments are passed to the store as the second argument', ()=> {
				proxy(123, 456);
				const recordArgs = mockCallStore.record.calls.mostRecent().args;

				expect(recordArgs[1]).toEqual([123, 456]);
			});

			it('a resolver for the returned promise is passed as the third argument', (done)=> {
				const callPromise = proxy();
				const recordArgs = mockCallStore.record.calls.mostRecent().args;
				const resolver = recordArgs[2];

				expect(resolver).toEqual(jasmine.any(Function));

				callPromise.then(done); // fails test if not called
				resolver();
			});
		});

		describe('When the implementation does exist', ()=> {
			beforeEach(()=> {
				mockImplementation = jasmine.createSpy('mockImplementation');
				proxy = createProxy(mockGetImplementation, mockCallStore);
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