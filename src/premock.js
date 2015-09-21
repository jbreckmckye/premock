module.exports = premock;

var FutureFunction = require('FutureFunction.js');
var CallStore = require('CallStore.js');
var createProxy = require('createProxy.js');

function premock(promise) {
	var futureFunction = new FutureFunction(promise);
	var callStore = new CallStore();
	var proxy = createProxy(futureFunction.getImplementation, callStore);
	proxy.resolveImplementation = futureFunction.resolveImplementation;

	return proxy;
}