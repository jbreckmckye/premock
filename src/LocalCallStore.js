module.exports = LocalCallStore;

LocalCallStore._storage = window.localStorage;

/**
 * CallPersistence: save the details of function calls to localStorage,
 * and let us fish them out, too.
 * @param storageKey String: key our calls will be stored against
 */
function LocalCallStore(storageKey) {
    var storage = LocalCallStore._storage;
    var existingRecords = storage.getItem(storageKey);
    var parametersPerCall = existingRecords ? JSON.parse(existingRecords) : [];

    this.record = function record(callArguments) {
        // Recording a call might fail if storage fills up.
        // So we clone our list before we mutate and commit it,
        // And only mutate the real list once we know the commit worked

        var newRecords = parametersPerCall.concat([callArguments]);

        // This might throw an error if storage is full
        updatePersistence(newRecords);

        // It's important to keep the original list in place at all times,
        // as this allows our deletion logic to match an element for deletion
        // by reference equality.
        parametersPerCall.push(callArguments);
    };

    this.getCalls = function getCalls() {
        return parametersPerCall.map(function(callParams) {
            return {
                callArguments : callParams,
                thisBinding : null,
                onExecuted : remove.bind(null, callParams) // delete calls from persistence once executed
            };
        });
    };

    function remove(callParams) {
        var elementIndex = parametersPerCall.indexOf(callParams);
        if (elementIndex !== -1) {
            parametersPerCall.splice(elementIndex, 1);
            updatePersistence(parametersPerCall);
        }
    }

    function updatePersistence(newRecords) {
        if (newRecords.length) {
            storage.setItem(storageKey, JSON.stringify(newRecords));
        } else {
            // Stop empty records littering localStorage
            storage.remove(storageKey);
        }
    }
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
