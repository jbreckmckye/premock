module.exports = LocalCallStore;

// Ghetto dependency injection
LocalCallStore._canUseLocalStorage = require('./canUseLocalStorage.js');
LocalCallStore._CallPersistence = require('./CallPersistence.js');

function LocalCallStore(storageKey) {
    if (LocalCallStore._canUseLocalStorage() === false) {
        throw new Error('Premock: did not detect localStorage');
    }

    var callPersistence = new LocalCallStore._CallPersistence(storageKey);

    this.record = function record(thisBinding, callArguments) {
        var serializedArgs;
        try {
            serializedArgs = JSON.stringify(callArguments);
        } catch (e) {
            throw new Error('Premock: could not serialize the call`s arguments. Perhaps they include a circular reference?');
        }

        callPersistence.recordArgs(serializedArgs);
    };

    this.getParametersPerCall = function getCalls() {
        var calls = callPersistence.getParametersPerCall();
        return calls.map(function (call, index) {
            // Return in a replayable format
            return {
                thisBinding : undefined,
                callArguments : call,
                onExecuted : once(function() {
                    // we want to delete call records at the moment they complete, but not a second earlier
                    callPersistence.remove(call);
                })
            };
        });
    };
}

function once(fn) {
    var hasRun = false;
    return function() {
        if (hasRun === false) {
            hasRun = true;
            fn();
        } else {
            // do nothing
        }
    };
}
