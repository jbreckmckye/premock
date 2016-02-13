module.exports = createRouter;

// Ghetto dependency injection
createRouter._Promise = window.Promise || null;

// Create a proxy for our future function.
// The proxy will route calls to either the real implementation - if it exists -
// or the call storage object.
function createRouter(laterFunction, callStore) {
	return function router() {
		var Promise = createRouter._Promise;
		var args = Array.prototype.slice.call(arguments);

		if (laterFunction.existsYet) {
			var implementation = laterFunction.getImplementation();
			var callReturn = implementation.apply(this, args);
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
