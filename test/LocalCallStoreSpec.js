'use strict';

const LocalCallStore = require('../src/LocalCallStore.js');

describe('LocalCallStore', ()=> {
    const testStorageKey = 'testStorageKey';
    const createStore = ()=> {
        return new LocalCallStore(testStorageKey);
    };
    let mockCallPersistence;

    beforeEach(()=> {
        LocalCallStore._canUseLocalStorage = ()=> true;
        mockCallPersistence = {
            record : ()=> {},
            getParametersPerCall : ()=> {},
            remove : ()=> {}
        };
    });

    describe('Reliance on local storage', ()=> {
        it('throws an error if localstorage not supported', ()=> {
            LocalCallStore._canUseLocalStorage = ()=> false;
            expect(createStore).toThrowError('Premock: did not detect localStorage');
        });

        it('does not throw an error otherwise', ()=> {
            LocalCallStore._canUseLocalStorage = ()=> true;
            expect(createStore).not.toThrowError();
        });
    });

    it('Initializes a persistence object with the provided key', ()=> {
        let callPersistenceArgs = [];
        LocalCallStore._CallPersistence = function() {
            callPersistenceArgs = arguments;
        };

        createStore();
        expect(callPersistenceArgs[0]).toBe(testStorageKey);
    });

    describe('Recording values', ()=> {
        it('passes call arguments to the persister', ()=> {
            LocalCallStore._CallPersistence = function() {
                return mockCallPersistence;
            };
            spyOn(mockCallPersistence, 'record');

            const store = createStore();

            const mockCallThisBinding = null;
            const mockCallArguments = ['foo', 'bar', 'baz'];
            store.record(mockCallThisBinding, mockCallArguments);

            // Get call arguments we've pushed to local storage
            const persistedCall = mockCallPersistence.record.calls.mostRecent().args[0];

            // Are the serialized arguments what we expect?
            expect(persistedCall).toEqual(JSON.stringify(mockCallArguments));
        });
    });

    describe('Retrieving values', ()=> {
        let store;
        let storedCalls = [[1,2,3],[4,5,6],[7,8,9]];

        beforeEach(()=> {
            LocalCallStore._CallPersistence = function() {
                return mockCallPersistence;
            };
            mockCallPersistence.getParametersPerCall = ()=> storedCalls;
            store = createStore();

        });

        it('returns a set of call objects for replaying', ()=> {
            const retrievedCalls = store.getCalls();
            expect(retrievedCalls).toEqual(jasmine.any(Array));
            expect(retrievedCalls[0]).toEqual(jasmine.any(Object));
        });

        describe('A call object', ()=> {
            it('has an `undefined` this binding, because heap objects cannot persist', ()=> {
                const retrievedCalls = store.getCalls();
                expect(retrievedCalls[0].thisBinding).toBeUndefined();
            });

            it('exposes the original call`s arguments, in a deserialized fashion', ()=> {
                const retrievedCalls = store.getCalls();
                expect(retrievedCalls[0].callArguments).toBeTruthy();
                expect(retrievedCalls[0].callArguments).toEqual([1,2,3]);
            });

            it('sets an on-executed callback that deletes the call from persistence once it is replayed', ()=> {
                const retrievedCalls = store.getCalls();

                expect(retrievedCalls[0].onExecuted).toEqual(jasmine.any(Function));

                spyOn(mockCallPersistence, 'remove');

                retrievedCalls[0].onExecuted(); // should delete the first persisted call
                expect(mockCallPersistence.remove).toHaveBeenCalled();
                expect(mockCallPersistence.remove).toHaveBeenCalledWith(storedCalls[0]); // expects the object to delete
            });
        })
    });
});
