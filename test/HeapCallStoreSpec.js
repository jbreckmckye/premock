'use strict';

const HeapCallStore = require('../src/HeapCallStore.js');

describe('HeapCallStore', ()=> {
	let heapStore;

	beforeEach(()=> {
		heapStore = new HeapCallStore();
	});

	describe('callStore.record', ()=> {

		it('is a function', ()=> {
			expect(heapStore.record).toEqual(jasmine.any(Function));
		});

		it('can take the binding, args-array and an onExecute callback for a recorded function call', ()=> {
			const mockThisBinding = {};
			const mockCallArguments = [123, 456];
			const mockOnExecutedCallback = ()=> {};

			expect(()=> {
				heapStore.record(mockCallArguments, mockThisBinding, mockOnExecutedCallback);
			}).not.toThrow();
		});

		it('can take an empty args-array', ()=> {
			const mockThisBinding = {};
			const mockCallArguments = [];

			expect(()=> {
				heapStore.record(mockCallArguments, mockThisBinding);
			}).not.toThrow();
		});
	});

	describe('callStore.getCalls', ()=> {

		it('is a function', ()=> {
			expect(heapStore.getCalls).toEqual(jasmine.any(Function));
		});

		it('initially returns an empty array', ()=> {
			expect(heapStore.getCalls()).toEqual([]);
		});

		it('returns an entry for every call record', ()=> {
			heapStore.record([], {});
			heapStore.record([], {});
			expect(heapStore.getCalls().length).toEqual(2);
		});

		it('the first item of the entry is the binding object', ()=> {
			const mockThisBinding = {};
			heapStore.record([], mockThisBinding);
			const firstCall = heapStore.getCalls()[0];

			expect(firstCall.thisBinding).toBe(mockThisBinding);
		});

		it('the second item of the entry equals the call arguments', ()=> {
			const mockCallArguments = [123, 456];
			heapStore.record(mockCallArguments, {});
			const firstCall = heapStore.getCalls()[0];

			expect(firstCall.callArguments).toEqual(mockCallArguments);
		});

		it('the third item of the entry equals the onExecute callback', ()=> {
			const mockOnExecutedCallback = ()=> {};
			heapStore.record([], {}, mockOnExecutedCallback);
			const firstCall = heapStore.getCalls()[0];

			expect(firstCall.onExecuted).toBe(mockOnExecutedCallback);
		});
	});
});