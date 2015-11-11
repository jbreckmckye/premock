'use strict';

const replayCalls = require('../src/replayCalls.js');

describe('replayCalls', ()=> {
	let mockDefer, mockImplementation;
	let mockOnExecuted = jasmine.createSpy('replayCalls.mockOnExecuted');	
	const mockCalls = [new MockCall(), new MockCall()];

	beforeEach(()=> {		
		mockImplementation = jasmine.createSpy('replayCalls.mockImplementation');
		mockDefer = jasmine.createSpy('replayCalls._defer');
		replayCalls._defer = mockDefer;
		mockOnExecuted.calls.reset();
	});

	it('Takes a list of call objects and an implementation function', ()=> {		
		const replayMockCalls = ()=> {
			replayCalls(mockCalls, mockImplementation);
		};
		expect(replayMockCalls).not.toThrow();
	});

	describe('Playback', ()=> {

		it('Uses a deferer to run the calls, so that any exceptions are isolated to their own events', ()=> {
			replayCalls(mockCalls, mockImplementation);
			expect(mockDefer.calls.count()).toBe(mockCalls.length);
		});

		it('The deferer is given a function that invokes the implementation', ()=> {
			replayCalls(mockCalls, mockImplementation);
			const firstDeferred = mockDefer.calls.first();
			const implementationInvoker = firstDeferred.args[0];

			expect(implementationInvoker).toEqual(jasmine.any(Function));

			implementationInvoker();
			expect(mockImplementation).toHaveBeenCalled();

			const invocationArguments = mockImplementation.calls.mostRecent().args;
			const expectedInvocationArguments = mockCalls[0].callArguments;
			expect(invocationArguments).toEqual(expectedInvocationArguments);
		});

		it('Runs the onExecuted callbacks for each call', ()=> {
			replayCalls._defer = (fn)=> {fn()}; // use synchronous implementation
			
			replayCalls(mockCalls, mockImplementation);

			expect(mockOnExecuted).toHaveBeenCalled();
			expect(mockOnExecuted.calls.count()).toBe(mockCalls.length);
		});

		it('Can run calls with null onExecuted callbacks', ()=> {
            // We need a real _defer implementation to try and execute the calls
            replayCalls._defer = (fn)=> {fn()};

            let mockCall = new MockCall();
            mockCall.onExecuted = null;

            replayCalls([mockCall], mockImplementation);
            expect(mockImplementation).toHaveBeenCalled();
        });

        it('Does not swallow exceptions thrown by the call', ()=> {
            // Replay calls synchronously for ease of testing
            replayCalls._defer = (fn) => {fn()};
            const mockError = new Error('Expected error');
            const mockImplementation = ()=> {throw mockError};
            expect(()=> {
                replayCalls([new MockCall()], mockImplementation);
            }).toThrow(mockError);
        });

		it('The onExecuted callback is run with the return value of the invocation as its argument', ()=> {
            // Replay calls synchronously for ease of testing
            replayCalls._defer = (fn) => {fn()};
			const mockImplementation = ()=> {return 123};

			replayCalls(mockCalls, mockImplementation);
			expect(mockOnExecuted).toHaveBeenCalledWith(123);			
		});

        it('Still runs the onExecuted callback even if the call throws an error', ()=> {
            // This is important, as otherwise we'd never delete the data for invalid calls

            // Replay calls synchronously for ease of testing
            replayCalls._defer = (fn) => {fn()};
            const mockError = new Error('Expected error');
            const mockImplementation = ()=> {throw mockError};
            try {
                replayCalls([new MockCall(), mockImplementation]);
            } catch (e) {}

            expect(mockOnExecuted).toHaveBeenCalled();
        });

	});	

	function MockCall() {
		this.thisBinding = {foo : 'foo'};
		this.callArguments = [123, 456];
		this.onExecuted = mockOnExecuted;
	}
});