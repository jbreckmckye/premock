module.exports = MaybeFunction;

function MaybeFunction() {
	var realFunction = null;

	this.resolveImplementation = function(fn) {
		if (realFunction === null) { // is this guard strictly MaybeFunction's responsibility?
			realFunction = fn;
		}		
	};

	this.getImplementation = function() {
		return realFunction;
	};
}