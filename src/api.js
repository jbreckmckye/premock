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
	var proxy = proxyLaterFunction(laterFunction, callStore);

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
