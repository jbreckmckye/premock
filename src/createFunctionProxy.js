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

		if (implementation) {
			var callReturn = implementation.apply(this, args);
			if (Promise) {
				return Promise.resolve(callReturn);
			} else {
				return callReturn;
			}
		} else {
			return new Promise(function(resolve){
				callStore.record(args, this, resolve);
			});
		}
	};
}
