module.exports = MaybeFunction;

function MaybeFunction(onResolve) {
	var that = this;
	var realFunction = null;

	this.resolveImplementation = function(fn) {
		realFunction = fn;
		onResolve();
	};

	this.getImplementation = function() {
		return realFunction;
	};
}