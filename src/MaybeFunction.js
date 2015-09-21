module.exports = FutureFunction;

function FutureFunction(onResolve, fnPromise) {
	var that = this;
	var realFunction = null;

	this.resolveImplementation = function(fn) {
		realFunction = fn;
		onResolve();
	};

	this.getImplementation = function() {
		return realFunction;
	};

	if(fnPromise && fnPromise.then) {
		fnPromise.then(function(fn){
			that.resolveImplementation(fn);
		});
	}
}