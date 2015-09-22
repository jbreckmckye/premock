module.exports = premock;

var MaybeFunction = require('./MaybeFunction.js');
var CallStore = require('./CallStore.js');
var createProxy = require('./createProxy.js');

function premock(promise) {
	var maybeFunction = new MaybeFunction(onImplemented, promise);
	var callStore = new CallStore();
	var proxy = createProxy(maybeFunction.getImplementation, callStore);
	proxy.resolveImplementation = maybeFunction.resolveImplementation;

	return proxy;

	function onImplemented() {
		// todo - replay historical calls. It's a pretty important todo!
	}

}