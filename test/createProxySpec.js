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
			})

			it('call arguments are passed to the store as the second argument', ()=> {
				proxy(123, 456);
				const recordArgs = mockCallStore.record.calls.mostRecent().args;

				expect(recordArgs[1]).toEqual([123, 456]);
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
			})

			it('does not swallow exceptions', ()=> {
				mockImplementation = ()=> {
					throw new Error('Mock error string');
				};
				const callBrokenImplementation = ()=> {proxy()};
				expect(callBrokenImplementation).toThrowError('Mock error string');
			})
		});
	});
});