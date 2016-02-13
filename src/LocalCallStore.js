module.exports = LocalCallStore;

LocalCallStore._storage = window.localStorage;

/**
 * LocalCallStore: save the details of function calls to localStorage,
 * and let us fish them out, too.
 * @param storageKey String: key our calls will be stored against
 */
function LocalCallStore(storageKey) {
    var storage = LocalCallStore._storage;
    var callData = getCallDataFromStore();

    this.record = function record(callArguments, thisBinding, onExecuted) {
        // Recording a call might fail if storage fills up.
        // So we clone our list before we mutate and commit it,
        // And only mutate the real list once we know the commit worked

        var newDatum = new Call(callArguments, onExecuted);
        var newRecords = callData.concat([newDatum]);

        // This might throw an error if storage is full
        putCallDataInStore(newRecords);

        // It's important to keep the original list in place at all times,
        // as this allows our deletion logic to match an element for deletion
        // by reference equality.
        callData.push(newDatum);
    };

    this.getCalls = function getCalls() {
        return callData.map(function(callDatum) {
            // Augment the onExecuted callback with an additional step to delete the data
            var originalOnExecuted = callDatum.onExecuted;

            callDatum.onExecuted = function onExecuted(result) {
                if (originalOnExecuted) {
                    originalOnExecuted(result);
                }
                remove(callDatum);
            };
            return callDatum;
        });
    };

    function remove(callParams) {
        var elementIndex = callData.indexOf(callParams);
        if (elementIndex !== -1) {
            callData.splice(elementIndex, 1);
            putCallDataInStore(callData);
        }
    }

    function Call(args, onExecuted) {
        this.callArguments = args;
        this.thisBinding = null;
        this.onExecuted = onExecuted;
    }

    function getCallDataFromStore() {
        var rawData = storage.getItem(storageKey);
        var paramsList = rawData ? JSON.parse(rawData) : [];
        return paramsList.map(function(params) {
            return new Call(params);
        });
    }

    function putCallDataInStore(newData) {
        var paramsList = newData.map(function(datum) {
            return datum.callArguments;
        });
        if (paramsList.length) {
            storage.setItem(storageKey, JSON.stringify(paramsList));
        } else {
            // Stop empty records littering localStorage
            storage.removeItem(storageKey);
        }
    }
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
