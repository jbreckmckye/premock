module.exports = createProxy;

// Ghetto dependency injection
createProxy._Promise = window.Promise || null;

function createProxy(getImplementation, callStore) {
	return function premocked() {
		var Promise = createProxy._Promise;

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
