module.exports = FutureFunction;

function FutureFunction(fnPromise) {
	var realFunction = null;

	if(fnPromise && fnPromise.then) {
		fnPromise.then(function(fn){
			realFunction = fn;
		});
	}

	this.resolveImplementation = function(fn) {
		realFunction = fn;
	};

	this.getImplementation = function() {
		return realFunction;
	};
}