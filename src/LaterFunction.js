module.exports = LaterFunction;

function LaterFunction() {
	var implementation = null;

	this.existsYet = false;

	this.resolve = function(fn) {
        if (!implementation) {
            implementation = fn;
            this.existsYet = true;
        }
	};

	this.getImplementation = function() {
		return implementation;
	};
}