module.exports = LocalCallStore;

// Ghetto dependency injection
LocalCallStore._CallPersistence = require('./CallPersistence.js');

function LocalCallStore(storageKey) {
    var callPersistence = new LocalCallStore._CallPersistence(storageKey);

    this.record = function record(callArguments) {
        var serializedArgs;
        try {
            serializedArgs = JSON.stringify(callArguments);
        } catch (e) {
            throw new Error('Premock: could not serialize the call`s arguments. Perhaps they include a circular reference?');
        }

        callPersistence.record(serializedArgs);
    };

    this.getCalls = function getCalls() {
        var calls = callPersistence.getParametersPerCall();
        return calls.map(function (call) {
            return {
                thisBinding : undefined,
                callArguments : call,
                onExecuted : function() {
                    // we want to delete call records at the moment they complete, but not a second earlier
                    callPersistence.remove(call);
                }
            };
        });
    };
}
