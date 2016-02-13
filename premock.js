(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.premock = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = HeapCallStore;

function HeapCallStore() {
	var calls = [];

	this.record = function record(callArguments, thisBinding, onExecuted) {
		calls.push({
			callArguments : callArguments,
			thisBinding: thisBinding,
			onExecuted : onExecuted
		});
	};

	this.getCalls = function getCalls() {
		return calls;
	};
}
},{}],2:[function(require,module,exports){
module.exports = LaterFunction;

function LaterFunction() {
	var implementation = null;

	this.existsYet = false;

	this.resolve = function(fn) {
        if (!implementation) {
            implementation = fn;
            this.existsYet = true;
        }
	};

	this.getImplementation = function() {
		return implementation;
	};
}
},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
// Public exports
module.exports =    premock;
                    premock.withoutPersistence = premockWithoutPersistence;

var LaterFunction = require('./LaterFunction.js');
var HeapCallStore = require('./HeapCallStore.js');
var LocalCallStore = require('./LocalCallStore.js');
var proxyLaterFunction = require('./proxyLaterFunction.js');
var replayCalls = require('./replayCalls.js');
var canUseLocalStorage = require('./canUseLocalStorage.js');

function premock(name, promise) {
    if (name === undefined) {
        throw new Error('Premock: needs a storage ID key');
    }
    
    if (canUseLocalStorage() === false) {
        throw new Error('Premock: did not detect localStorage');
    }

    var callStore = new LocalCallStore(name.toString());
    return createPremocker(callStore, promise);
}

function premockWithoutPersistence(promise) {
	var callStore = new HeapCallStore();
	return createPremocker(callStore, promise);
}

function createPremocker(callStore, pendingImplementation) {
	var laterFunction = new LaterFunction();

    // Create a proxy for our upcoming function.
    // It will pass calls to the callstore until it can call the laterFunction
	var proxy = proxyLaterFunction(laterFunction, callStore);

    // Create a means to resolve the laterFunction
	proxy.resolve = function resolvePremock(implementation) {
		laterFunction.resolve(implementation);
		replayCalls(callStore.getCalls(), implementation);
	};

    // We can pass in a 'pendingImplementation' promise that will replaced the premocked function on resolution
	if (pendingImplementation && pendingImplementation.then) {
		pendingImplementation.then(proxy.resolve);
	}

	return proxy;
}

},{"./HeapCallStore.js":1,"./LaterFunction.js":2,"./LocalCallStore.js":3,"./canUseLocalStorage.js":5,"./proxyLaterFunction.js":7,"./replayCalls.js":8}],5:[function(require,module,exports){
module.exports = canUseLocalStorage;

// Expose dependencies for testing
canUseLocalStorage._localStorage = window.localStorage;

function canUseLocalStorage() {
    var storage = canUseLocalStorage._localStorage;
    return !!storage && canStoreItems();

    function canStoreItems() {
        // This can fail if browser security settings give storage a zero quota (i.e. Safari)

        if (storage.length) {
            return true; // items are stored, so storage must have a quota
        } else {
            try {
                testStorage();
            } catch (e) {
                return false;
            }
            // If successful...
            return true;
        }

        function testStorage() {
            storage.setItem('premock-feature-test', 'abc');
            storage.removeItem('premock-feature-test');
        }
    }
}
},{}],6:[function(require,module,exports){
module.exports = defer;

function defer(fn) {
	window.setTimeout(fn, 0);
}
},{}],7:[function(require,module,exports){
module.exports = proxyLaterFunction;

// Ghetto dependency injection
proxyLaterFunction._Promise = window.Promise || null;

// Create a proxy for our future function.
// The proxy will route calls to either the real implementation - if it exists -
// or the call storage object.
function proxyLaterFunction(laterFunction, callStore) {
	return function functionProxy() {
		var Promise = proxyLaterFunction._Promise;
		var args = Array.prototype.slice.call(arguments);

		if (laterFunction.existsYet) {
            var implementation = laterFunction.getImplementation();
			var callReturn = implementation.apply(this, args);
			if (Promise) {
				return Promise.resolve(callReturn);
			} else {
				return callReturn;
			}
		} else {
            if (Promise) {
                var that = this;
                return new Promise(function(resolve){
                    callStore.record(args, that, resolve);
                });
            } else {
                callStore.record(args, this, null);
            }
		}
	};
}

},{}],8:[function(require,module,exports){
module.exports = replayCalls;

// Ghetto dependency injection
replayCalls._defer = require('./defer.js');

function replayCalls(calls, implementation) {
	var defer = replayCalls._defer;

	// We give each call its own event so that if one throws an exception, the others still run
	calls.forEach(function(call){
		var result;
		var thisBinding = call.thisBinding || null; // Calls from previous pages will lack bindings
		defer(function(){
			var errors;
			try {
			    result = implementation.apply(thisBinding, call.callArguments);
			} catch (e) {
			    errors = e;
			}

			if (call.onExecuted) {
				call.onExecuted(result);
			}

			if (errors) {
				throw errors;
			}
		});
	});
}

},{"./defer.js":6}]},{},[4])(4)
});