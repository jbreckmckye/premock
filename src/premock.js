module.exports = premock;

var FutureFunction = require('./FutureFunction.js');
var CallStore = require('./CallStore.js');
var createProxy = require('./createProxy.js');

function premock(promise) {
	var futureFunction = new FutureFunction(onImplemented, promise);
	var callStore = new CallStore();
	var proxy = createProxy(futureFunction.getImplementation, callStore);
	proxy.resolveImplementation = futureFunction.resolveImplementation;

	return proxy;

	function onImplemented() {
		// todo - replay historical calls. It's a pretty important todo!
	}

}