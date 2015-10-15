module.exports = CallPersistence;

CallPersistence._storage = window.localStorage;

/**
 * CallPersistence: save the details of function calls to localStorage,
 * and let us fish them out, too.
 * @param storageKey String: key our calls will be stored against
 */
function CallPersistence(storageKey) {
    var storage = CallPersistence._storage;
    var existingRecords = storage.getItem(storageKey);
    var parametersPerCall = existingRecords ? JSON.parse(existingRecords) : [];

    this.record = function record(callArgs) {
        // We create a backup state, so we can recover from storage errors
        var backupParametersPerCall = clone(parametersPerCall);
        parametersPerCall.push(callArgs);
        // This might throw an error if storage is full
        try {
            updatePersistence();
        } catch (e) {
            parametersPerCall = backupParametersPerCall;
            throw e;
        }
    };

    this.getParametersPerCall = function getParametersPerCall() {
        return clone(parametersPerCall);
    };

    this.remove = function remove(element) {
        var elementIndex = parametersPerCall.indexOf(element);
        if (elementIndex !== -1) {
            parametersPerCall.splice(elementIndex, 1);
            updatePersistence();
        }
    };

    function updatePersistence() {
        var serializedPartition = JSON.stringify(parametersPerCall);
        storage.setItem(storageKey, serializedPartition);
    }
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}