module.exports = premock;

var MaybeFunction = require('./MaybeFunction.js');
var CallStore = require('./CallStore.js');
var createProxy = require('./createProxy.js');
var replayCalls = require('./replayCalls.js');

function premock(promise) {
	var maybeFunction = new MaybeFunction(onImplemented);
	var callStore = new CallStore();	
	var proxy = createProxy(maybeFunction.getImplementation, callStore);

	proxy.resolve = maybeFunction.resolveImplementation;
	if (promise && promise.then) {
		promise.then(maybeFunction.resolveImplementation);
	}

	return proxy;

	function onImplemented(implementation) {
		replayCalls(callStore.getCalls(), implementation);
	}
}