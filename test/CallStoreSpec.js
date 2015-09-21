'use strict';

const CallStore = require('../src/CallStore.js');

describe('CallStore', ()=> {
	let store;

	beforeEach(()=> {
		store = new CallStore();
	});

	describe('callStore.record', ()=> {

		it('is a function', ()=> {
			expect(store.record).toEqual(jasmine.any(Function));
		});

		it('can take the binding and args-array of a function call', ()=> {
			const mockThisBinding = {};
			const mockCallArguments = [123, 456];

			expect(()=> {
				store.record(mockThisBinding, mockCallArguments);
			}).not.toThrow();
		});

		it('can take an empty args-array', ()=> {
			const mockThisBinding = {};
			const mockCallArguments = [];

			expect(()=> {
				store.record(mockThisBinding, mockCallArguments);
			}).not.toThrow();
		});
	});

	describe('callStore.getCalls', ()=> {

		it('is a function', ()=> {
			expect(store.getCalls).toEqual(jasmine.any(Function));
		});

		it('initially returns an empty array', ()=> {
			expect(store.getCalls()).toEqual([]);
		});

		it('returns an entry for every call record', ()=> {
			store.record({}, []);
			store.record({}, []);
			expect(store.getCalls().length).toEqual(2);
		});

		it('each entry is an array with two elements', ()=> {
			store.record({}, []);
			store.record({}, []);

			expect(store.getCalls()[0].length).toEqual(2);
			expect(store.getCalls()[1].length).toEqual(2);
		});

		it('the first item of the entry is the binding object', ()=> {
			const mockThisBinding = {};
			store.record(mockThisBinding, []);
			const firstCall = store.getCalls()[0];

			expect(firstCall[0]).toBe(mockThisBinding);
		});

		it('the second item of the entry equals the call arguments', ()=> {
			const mockCallArguments = [123, 456];
			store.record({}, mockCallArguments);
			const firstCall = store.getCalls()[0];

			expect(firstCall[1]).toEqual(mockCallArguments);
		});

		it('operations on the returned array do not affect subsequent returned arrays', ()=> {
			let setOne = store.getCalls();
			setOne.push('illegal data');
			let setTwo = store.getCalls();

			expect(setTwo.length).toBe(0);
		});
	});
});