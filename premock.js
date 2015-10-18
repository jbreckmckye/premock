(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.premock = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        return parametersPerCall;
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
},{}],2:[function(require,module,exports){
module.exports = HeapCallStore;

function HeapCallStore() {
	var calls = [];

	this.record = function record(callArguments, thisBinding, onExecuted) {
		calls.push({
			thisBinding: thisBinding, 
			callArguments : callArguments,
			onExecuted : onExecuted
		});
	};

	this.getCalls = function getCalls() {
		// Use slice to clone
		return calls.slice(0);
	};
}
},{}],3:[function(require,module,exports){
module.exports = LocalCallStore;

// Ghetto dependency injection
LocalCallStore._CallPersistence = require('./CallPersistence.js');

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

},{"./CallPersistence.js":1}],4:[function(require,module,exports){
module.exports = MaybeFunction;

function MaybeFunction() {
	var realFunction = null;

	this.resolveImplementation = function(fn) {
		if (realFunction === null) { // is this guard strictly MaybeFunction's responsibility?
			realFunction = fn;
		}		
	};

	this.getImplementation = function() {
		return realFunction;
	};
}
},{}],5:[function(require,module,exports){
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
module.exports = createProxy;

// Ghetto dependency injection
createProxy._Promise = window.Promise || null;

function createProxy(getImplementation, callStore) {
	return function premocked() {
		var Promise = createProxy._Promise;

		var args = Array.prototype.slice.call(arguments);
		var implementation = getImplementation();
		var returnedPromise;
		var returnedPromiseResolver = null;

		if (Promise) {
            // If we can, we return a promise of the call`s eventual execution
            // When the implementation is delivered, that promise is resolved with
            // the return value of the replay
			returnedPromise = new Promise(function(resolve){
				returnedPromiseResolver = resolve;
			});
		}

		if (implementation) {
			var callReturn = implementation.apply(this, args);
            if (returnedPromise) {
                returnedPromiseResolver(callReturn);
            } else {
                return callReturn;
            }
		} else {
			callStore.record(args, this, returnedPromiseResolver);
		}

		return returnedPromise || undefined;
	};
}

},{}],7:[function(require,module,exports){
module.exports = defer;

function defer(fn) {
	window.setTimeout(fn, 0);
}
},{}],8:[function(require,module,exports){
// Public exports
module.exports =    premock;
                    premock.withPersistence = premockWithPersistence;

var MaybeFunction = require('./MaybeFunction.js');
var HeapCallStore = require('./HeapCallStore.js');
var LocalCallStore = require('./LocalCallStore.js');
var createProxy = require('./createProxy.js');
var replayCalls = require('./replayCalls.js');
var canUseLocalStorage = require('./canUseLocalStorage.js');

function premock(promise) {
    return createPremocker(new HeapCallStore(), promise);
}

function premockWithPersistence(name, promise) {
    if (canUseLocalStorage() === false) {
        throw new Error('Premock: did not detect localStorage');
    }

    if (typeof name !== 'string') {
        throw new Error('Premock: needs a storage ID key');
    }

    return createPremocker(new LocalCallStore(name), promise);

}

function createPremocker(callStore, implementationPromise) {
	var maybeFunction = new MaybeFunction();
	var proxy = createProxy(maybeFunction.getImplementation, callStore);

	proxy.resolve = function resolvePremock(implementation) {
		maybeFunction.resolveImplementation(implementation);
		replayCalls(callStore.getCalls(), implementation);
	};

	if (implementationPromise && implementationPromise.then) {
		implementationPromise.then(maybeFunction.resolveImplementation);
	}

	return proxy;
}
},{"./HeapCallStore.js":2,"./LocalCallStore.js":3,"./MaybeFunction.js":4,"./canUseLocalStorage.js":5,"./createProxy.js":6,"./replayCalls.js":9}],9:[function(require,module,exports){
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
			result = implementation.apply(thisBinding, call.callArguments);
			if (call.onExecuted) {
                call.onExecuted(result);
            }
		});
	});
}
},{"./defer.js":7}]},{},[8])(8)
});