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
    if (premockWithPersistence._canUseLocalStorage() === false) {
        throw new Error('Premock: did not detect localStorage');
    } else {
        return createPremocker(new LocalCallStore(name), promise);
    }
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