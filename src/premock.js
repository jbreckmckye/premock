module.exports = premock;

var MaybeFunction = require('./MaybeFunction.js');
var HeapCallStore = require('./HeapCallStore.js');
var LocalCallStore = require('./LocalCallStore.js');
var createProxy = require('./createProxy.js');
var replayCalls = require('./replayCalls.js');

function premock(promise) {
    return createPremocker(new HeapCallStore(), promise);
}

premock.withPersistence = function premockWithPersistence(name, promise) {
    return createPremocker(new LocalCallStore(name), promise);
};

function createPremocker(callStore, implementationPromise) {
	var maybeFunction = new MaybeFunction(onImplemented);
	var proxy = createProxy(maybeFunction.getImplementation, callStore);

	proxy.resolve = maybeFunction.resolveImplementation;
	if (implementationPromise && implementationPromise.then) {
		implementationPromise.then(maybeFunction.resolveImplementation);
	}

	return proxy;

	function onImplemented(implementation) {
		replayCalls(callStore.getCalls(), implementation);
	}
}