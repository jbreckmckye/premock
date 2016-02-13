module.exports = createFunctionProxy;

// Ghetto dependency injection
createFunctionProxy._Promise = window.Promise || null;

// Create a proxy for our future function.
// The proxy will route calls to either the real implementation - if it exists -
// or the call storage object.
function createFunctionProxy(getImplementation, callStore) {
	return function functionProxy() {
		var Promise = createFunctionProxy._Promise;

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
			// Passing in the 'this' value means we can bind object methods
		}

		return returnedPromise || undefined;
	};
}
