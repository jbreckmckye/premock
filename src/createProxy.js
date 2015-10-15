module.exports = createProxy;

// Ghetto dependency injection
createProxy._Promise = window.Promise || null;

function createProxy(getImplementation, callStore) {
	return function premocked() {
		var Promise = createProxy._Promise;

		var args = Array.prototype.slice.call(arguments);
		var implementation = getImplementation();
		var returnedPromise;
		var onCallReplayed = null;

		if (Promise) {
            // If we can, we return a promise of the call`s eventual execution
            // When the implementation is delivered, that promise is resolved with
            // the return value of the replay
			returnedPromise = new Promise(function(resolve){
				onCallReplayed = function(returnValueOfReplay) {
					resolve(returnValueOfReplay);
				}
			});
		}

		if (implementation) {
			var callReturn = implementation.apply(this, args);
            if (returnedPromise && onCallReplayed) {
                onCallReplayed(callReturn);
            } else {
                return callReturn;
            }
		} else {
			callStore.record(this, args, onCallReplayed);
		}

		return returnedPromise || undefined;
	};
}
