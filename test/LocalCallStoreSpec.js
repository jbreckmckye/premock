'use strict';

const LocalCallStore = require('../src/LocalCallStore.js');

describe('Local call store', ()=> {
    const storageKey = 'testStorageKey';

    let scenario;

    afterEach(()=> {
        scenario.tearDown();
    });

    describe('Retrieving calls', ()=> {

        describe('From empty original data', ()=> {
            beforeEach(()=> {
                scenario = new Scenario();
            });

            it('getCalls returns an empty set', ()=> {
                const calls = scenario.store.getCalls();
                expect(calls).toEqual([]);
            });
        });

        describe('From non-empty original data', ()=> {
            const originalData = [
                ['The', 'first', 'call`s', 'arguments'],
                ['The', 'second', 'call`s'],
                ['And', 'the', 'third`s']
            ];
            let calls;

            beforeEach(()=> {
                scenario = new Scenario(originalData);
                calls = scenario.store.getCalls();
            });

            it('getCalls returns an object per stored call', ()=> {
                expect(calls.length).toEqual(originalData.length);
            });

            it('each object comes with the parameters for each stored call', ()=> {
                const parametersSet = calls.map(call => call.callArguments);
                expect(parametersSet).toEqual(originalData);
            });

            it('each object comes with a null `this` binding', ()=> {
                const bindingsSet = calls.map(call => call.thisBinding);
                expect(bindingsSet).toEqual([null, null, null]);
            });

            it('each object comes with an `onExecuted` callback', ()=> {
                const callbacks = calls.map(call => call.onExecuted);
                callbacks.forEach(callback => {
                    expect(callback).toEqual(jasmine.any(Function));
                });
            });

            it('if I call the `onExecuted` callback from a stored call, it deletes it', ()=> {
                calls[1].onExecuted();
                const callData = scenario.getCallData();
                expect(callData.length).toEqual(originalData.length - 1);
                expect(callData[0]).toEqual(originalData[0]);
                expect(callData[1]).toEqual(originalData[2]);
            });

            it('after deleting the stored call, getCalls does not return it', ()=> {
                calls[1].onExecuted();
                expect(scenario.store.getCalls().length).toBe(2);
            });
        });

        describe('From calls recorded subsequently', ()=> {
            const newData = [
                ['arg', 'set', 1],
                ['arg', 'set', 2],
                ['arg', 'set', 3]
            ];
            let calls;

            beforeEach(()=> {
                scenario = new Scenario();
                newData.forEach(newDatum => scenario.store.record(newDatum));
                calls = scenario.store.getCalls();
            });

            it('getCalls returns an object per stored call', ()=> {
                expect(calls.length).toEqual(newData.length);
            });

            it('each object comes with the parameters for each stored call', ()=> {
                const parametersSet = calls.map(call => call.callArguments);
                expect(parametersSet).toEqual(newData);
            });

            it('each object comes with a null `this` binding', ()=> {
                const bindingsSet = calls.map(call => call.thisBinding);
                expect(bindingsSet).toEqual([null, null, null]);
            });

            it('each object comes with an `onExecuted` callback', ()=> {
                const callbacks = calls.map(call => call.onExecuted);
                callbacks.forEach(callback => {
                    expect(callback).toEqual(jasmine.any(Function));
                });
            });

            it('if I call the `onExecuted` callback from a stored call, it deletes it', ()=> {
                calls[1].onExecuted();
                const callData = scenario.getCallData();
                expect(callData.length).toEqual(newData.length - 1);
                expect(callData[0]).toEqual(newData[0]);
                expect(callData[1]).toEqual(newData[2]);
            });

            it('after deleting the stored call, getCalls does not return it', ()=> {
                calls[1].onExecuted();
                expect(scenario.store.getCalls().length).toBe(2);
            });
        });

        function Scenario(startingData) {
            if (startingData) {
                localStorage.setItem(storageKey, JSON.stringify(startingData));
            }

            this.store = new LocalCallStore(storageKey);

            this.getCallData = function () {
                return JSON.parse(localStorage.getItem(storageKey));
            };

            this.tearDown = function () {
                localStorage.removeItem(storageKey);
            }
        }
    });

    describe('Handling storage errors', ()=> {
        let store, mockStorage;

        beforeEach(()=> {
            LocalCallStore._storage = new BreakableStorage();
            store = new LocalCallStore('mock storage key');
            mockStorage = LocalCallStore._storage;
        });

        afterEach(()=> {
            LocalCallStore._storage = window.localStorage;
        });

        it('Does not swallow errors', ()=> {
            mockStorage.shouldThrow = true;

            const faultyRecording = function() {
                store.record([1, 2, 3]);
            };

            expect(faultyRecording).toThrow(mockStorage.storageException);
        });

        it('Calling getCalls() after a storage error returns only the successfully stored calls', ()=> {
            const firstParams = ['alpha', 'beta', 'gamma'];
            const secondParams = [2, 4, 8];
            const thirdParams = ['Agamemnon', 'Menelaus', 'Clytemnestra'];

            // Store succeeds
            mockStorage.shouldThrow = false;
            store.record(firstParams);

            // Store fails (e.g. storage full)
            try {
                mockStorage.shouldThrow = true;
                store.record(secondParams);
            } catch (e) {}

            // Store succeeds again (e.g. data just fits)
            mockStorage.shouldThrow = false;
            store.record(thirdParams);

            const storedCalls = store.getCalls();
            const storedCallArgs = storedCalls.map(storedCall => storedCall.callArguments);
            expect(storedCallArgs).toEqual([firstParams, thirdParams]);
        });

        function BreakableStorage() {
            this.shouldThrow = false;
            this.storageException = new Error('Mock storage exception');

            this.getItem = (key) => {
                return window.localStorage.getItem(key);
            };
            this.setItem = (key, value)=> {
                if (this.shouldThrow) {
                    throw this.storageException;
                } else {
                    window.localStorage.setItem(key, value);
                }
            };
        }
    })



});
