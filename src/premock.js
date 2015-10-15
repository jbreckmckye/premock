module.exports = premock;

var MaybeFunction = require('./MaybeFunction.js');
var HeapCallStore = require('./HeapCallStore.js');
var createProxy = require('./createProxy.js');
var replayCalls = require('./replayCalls.js');

function premock(promise) {
	var maybeFunction = new MaybeFunction(onImplemented);
	var heapCallStore = new HeapCallStore();
	var proxy = createProxy(maybeFunction.getImplementation, heapCallStore);

	proxy.resolve = maybeFunction.resolveImplementation;
	if (promise && promise.then) {
		promise.then(maybeFunction.resolveImplementation);
	}

	return proxy;

	function onImplemented(implementation) {
		replayCalls(heapCallStore.getCalls(), implementation);
	}
}