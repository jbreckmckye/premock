'use strict';

const CallPersistence = require('../src/CallPersistence.js');
const MockStorage = require('./MockStorage');

describe('CallPersistence', ()=> {
    let callPersister;
    beforeEach(()=> {
        CallPersistence._storage = new MockStorage();
        callPersister = new CallPersistence('something');
    });

    it('Initially returns an empty array of calls', ()=> {
        expect(callPersister.getParametersPerCall()).toEqual([]);
    });

    it('Allows us to record call parameter lists', ()=> {
        expect(function recordSingleParam() {
            callPersister.record(['foo'])
        }).not.toThrow();

        expect(function recordMultipleParams() {
            callPersister.record(['foo', 'bar'])
        }).not.toThrow();

        expect(function recordNoParams() {
            callPersister.record([])
        }).not.toThrow();
    });

    // xit : recorded call is put in storage
    // xit : stored call can be deserialized
    // xit : returned lists can be mutated safely
    // xit : storage errors don't break stuff

});
