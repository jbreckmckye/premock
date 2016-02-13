module.exports = proxyLaterFunction;

// Ghetto dependency injection
proxyLaterFunction._Promise = window.Promise || null;

// Create a proxy for our future function.
// The proxy will route calls to either the real implementation - if it exists -
// or the call storage object.
function proxyLaterFunction(getLaterFunction, callStore) {
	return function functionProxy() {
		var Promise = proxyLaterFunction._Promise;
		var args = Array.prototype.slice.call(arguments);
		var laterFunction = getLaterFunction();
		if (laterFunction) {
			var callReturn = laterFunction.apply(this, args);
			if (Promise) {
				return Promise.resolve(callReturn);
			} else {
				return callReturn;
			}
		} else {
            if (Promise) {
                var that = this;
                return new Promise(function(resolve){
                    callStore.record(args, that, resolve);
                });
            } else {
                callStore.record(args, this, null);
            }
		}
	};
}
