// Public exports
module.exports =    premock;
                    premock.withoutPersistence = premockWithoutPersistence;

var MaybeFunction = require('./MaybeFunction.js');
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

function createPremocker(callStore, implementationPromise) {
	var maybeFunction = new MaybeFunction();
	var proxy = proxyLaterFunction(maybeFunction.getImplementation, callStore);

	proxy.resolve = function resolvePremock(implementation) {
		maybeFunction.setImplementation(implementation);
		replayCalls(callStore.getCalls(), implementation);
	};

	if (implementationPromise && implementationPromise.then) {
		implementationPromise.then(proxy.resolve);
	}

	return proxy;
}
