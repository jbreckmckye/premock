module.exports = LaterFunction;

function LaterFunction() {
	var implementation = null;

	this.resolve = function(fn) {
        if (!implementation) {
            implementation = fn;
        }
	};

	this.getImplementation = function() {
		return implementation;
	};
}