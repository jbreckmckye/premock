module.exports = createProxy;

function createProxy(getImplementation, callStore) {
	return function premocked() {
		var args = Array.prototype.slice.call(arguments);
		var implementation = getImplementation();

		if (implementation) {
			implementation.apply(this, args);
		} else {
			callStore.record(this, args);
		}
	};
}