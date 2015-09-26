module.exports = MaybeFunction;

function MaybeFunction(onResolve) {
	var that = this;
	var realFunction = null;

	this.resolveImplementation = function(fn) {
		if (realFunction === null) {
			realFunction = fn;
			onResolve(realFunction);
		}		
	};

	this.getImplementation = function() {
		return realFunction;
	};
}