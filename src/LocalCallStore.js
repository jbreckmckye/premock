module.exports = LocalCallStore;

// Ghetto dependency injection
LocalCallStore._CallPersistence = require('./CallPersistence.js');

// todo This file is no longer needed; let's refactor it away...

function LocalCallStore(storageKey) {
    var callPersistence = new LocalCallStore._CallPersistence(storageKey);

    this.record = function record(callArguments) {
        callPersistence.record(callArguments);
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
