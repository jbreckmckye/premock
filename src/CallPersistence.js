module.exports = CallPersistence;

CallPersistence._storage = window.localStorage;

function CallPersistence(storageKey) {
    var storage = CallPersistence._storage;
    var existingRecords = storage.getItem(storageKey);
    var parametersPerCall = existingRecords ? JSON.parse(existingRecords) : [];

    this.record = function record(callArgs) {
        // We create a draft state and try to save it, so that storage errors don't
        // pull the in-memory list and the persisted list out of sync
        var newParametersPerCall = clone(parametersPerCall);
        newParametersPerCall.push(callArgs);
        // This might throw an error if storage is full
        updatePersistence();
        parametersPerCall = newParametersPerCall;
    };

    this.getParametersPerCall = function getParametersPerCall() {
        return clone(parametersPerCall);
    };

    this.remove = function remove(index) {
        parametersPerCall.splice(index, 1);
        updatePersistence();
    };

    function updatePersistence() {
        var serializedPartition = JSON.stringify(parametersPerCall);
        storage.setItem(storageKey, serializedPartition);
    }
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}