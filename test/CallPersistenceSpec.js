'use strict';

const CallPersistence = require('../src/CallPersistence.js');
const MockStorage = require('./MockStorage');

describe('CallPersistence', ()=> {
    let callPersister, mockStorage;
    beforeEach(()=> {
        mockStorage = new MockStorage();
        spyOn(mockStorage, 'setItem');

        CallPersistence._storage = mockStorage;
        callPersister = new CallPersistence('something');
    });

    describe('It saves calls into the storage item', ()=> {

        it('Saves the call data under the key we initialize it with', ()=> {
            callPersister.record([]);

            const storageAction = mockStorage.setItem.calls.mostRecent();
            const storageActionKey = storageAction.args[0];

            expect(storageActionKey).toBe('something');
        });

        it('Accompanies that key with a serialized array, which details all the calls', ()=> {
            callPersister.record([]);

            const storageAction = mockStorage.setItem.calls.mostRecent();
            const storageActionValue = storageAction.args[1];
            const parsedStorageValue = JSON.parse(storageActionValue);

            expect(parsedStorageValue).toEqual(jasmine.any(Array));            
        });

        it('The call records are themselves the arrays we push to .record', ()=> {
            callPersister.record([1,2,3]);
            callPersister.record([4,5,6]);

            const storageAction = mockStorage.setItem.calls.mostRecent();
            const storageActionValue = storageAction.args[1];
            const parsedStorageValue = JSON.parse(storageActionValue);

            expect(parsedStorageValue).toEqual([[1,2,3],[4,5,6]]);
        });

        it('If the localstorage records already have members, it can append new ones', ()=> {
            mockStorage.getItem = ()=> {
                return '[[1,2,3]]';
            };
            callPersister = new CallPersistence('foo');
            callPersister.record([4,5,6]);

            const storageAction = mockStorage.setItem.calls.mostRecent();
            const storageActionValue = storageAction.args[1];
            const parsedStorageValue = JSON.parse(storageActionValue);

            expect(parsedStorageValue).toEqual([[1,2,3],[4,5,6]]);
        });

    });

    describe('It lets us retreive recorded calls', ()=> {

        it('If localstorage is empty, getParametersPerCall gives us an empty array', ()=> {
            const retrieval = callPersister.getParametersPerCall();
            expect(retrieval).toEqual([]);
        });

        it('If localstorage has contents, getParametersPerCall gives us the contents under that key', ()=> {
            const storeContents = [[1,2,3],[4,5,6]];
            mockStorage.getItem = (key)=> {
                if (key === 'foo') {
                    return JSON.stringify(storeContents);
                } else {
                    return '[[]]';
                }
            };
            callPersister = new CallPersistence('foo');
            const retrieval = callPersister.getParametersPerCall();
            expect(retrieval).toEqual(storeContents);
        });

        it('If localstorage has contents, and we add more records, getParametersPerCall will retrieve everything', ()=> {
            mockStorage.getItem = ()=> {
                return '[[1,2,3]]';
            };
            callPersister = new CallPersistence('foo');
            callPersister.record([4,5,6]);

            const retrieval = callPersister.getParametersPerCall();
            expect(retrieval).toEqual([[1,2,3],[4,5,6]]);
        });
    });

    it('Allows us to remove an item', ()=> {
        const argSets = [
            [1,2,3],
            [4,5,6],
            [7,8,9]
        ];

        callPersister.record(argSets[0]);
        callPersister.record(argSets[1]);
        callPersister.record(argSets[2]);

        callPersister.remove(argSets[1]);
        const retrieval = callPersister.getParametersPerCall();
        expect(retrieval).toEqual([[1,2,3],[7,8,9]]);
    });

    describe('Fault tolerance', ()=> {
        it('If recording begins throwing an exception (e.g. storage fills up), those errors are not swallowed', ()=> {
            mockStorage.setItem = ()=> {throw new Error('Mock storage error')};
            callPersister = new CallPersistence('foo');
            const attemptForlornRecording = ()=> {
                callPersister.record([]);
            };
            expect(attemptForlornRecording).toThrow(new Error('Mock storage error'));
        });

        it('If recording begins throwing an exception (e.g. storage has filled up), getParametersPerCall returns only the successful recordings', ()=> {
            let setItemThrowsError = false;
            mockStorage.setItem = ()=> {
                if (setItemThrowsError) {
                    throw new Error('Mock storage error');
                }
            };

            callPersister = new CallPersistence('foo');
            
            callPersister.record([0]);
            setItemThrowsError = true;
            try {
                callPersister.record([1]);
            } catch (e) {
                // We know this is going to fail
            }
            
            const retrieval = callPersister.getParametersPerCall();
            expect(retrieval).toEqual([[0]]);
        });
    });
});
