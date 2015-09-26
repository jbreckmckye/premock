module.exports = createProxy;

// Ghetto dependency injection
createProxy._Promise = window.Promise || null;

function createProxy(getImplementation, callStore) {
	return function premocked() {
		var Promise = createProxy._Promise;

		var args = Array.prototype.slice.call(arguments);
		var implementation = getImplementation();
		var callPromise;
		var onRealCall;
		var callReturn;

		if (Promise) {
			callPromise = new Promise(function(resolve){
				onRealCall = resolve;
			});
		}

		if (implementation) {
			callReturn = implementation.apply(this, args);
			onRealCall(callReturn);
		} else {
			callStore.record(this, args, onRealCall);
		}

		return callPromise;
	};
}

