'use strict';

let canUseLocalStorage = require('../src/canUseLocalStorage');
const MockStorage = require('./MockStorage');

describe('canUseLocalStorage', ()=> {
    beforeEach(()=> {
        canUseLocalStorage._localStorage = new MockStorage();
    });

    describe('When storage does not exist', ()=> {
        beforeEach(()=> {
            canUseLocalStorage._localStorage = undefined;
        });

        it('Returns false', ()=> {
            expect(canUseLocalStorage()).toBe(false);
        });
    });

    describe('When storage does exist', ()=> {
        let mockStorage;

        beforeEach(()=> {
            mockStorage = new MockStorage();
            canUseLocalStorage._localStorage = mockStorage;
            spyOn(mockStorage, 'setItem');
            spyOn(mockStorage, 'getItem');
            spyOn(mockStorage, 'removeItem');
        });

        it('Tests storage quota by writing dummy data', ()=> {
            canUseLocalStorage();
            expect(mockStorage.setItem).toHaveBeenCalled();
        });

        it('Cleans up after itself', ()=> {
            canUseLocalStorage();
            const dummyStoreDataKey = mockStorage.setItem.calls.first().args[0];
            const dummyDeleteDataKey = mockStorage.removeItem.calls.first().args[0];
            expect(dummyDeleteDataKey).toEqual(dummyStoreDataKey);
        });
    });

    describe('When storage is broken, e.g. is full', ()=> {
        beforeEach(()=> {
            let badStorage = new MockStorage();
            badStorage.setItem = ()=> {throw new Error('Mock storage error')};
            canUseLocalStorage._localStorage = badStorage;
        });

        it('Returns false', ()=> {
            expect(canUseLocalStorage()).toBe(false);
        });

        it('Swallows the storage exceptions', ()=> {
            expect(canUseLocalStorage).not.toThrow();
        });
    });

    describe('When storage is working', ()=> {
        beforeEach(()=> {
            canUseLocalStorage._localStorage = new MockStorage();
        });

        it('Returns true', ()=> {
            expect(canUseLocalStorage()).toBe(true);
        });
    });
});