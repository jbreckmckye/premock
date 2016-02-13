module.exports = MaybeFunction;

function MaybeFunction() {
	var implementation = null;

	this.setImplementation = function(fn) {
        implementation = fn;
	};

	this.getImplementation = function() {
		return implementation;
	};
}