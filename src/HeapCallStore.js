module.exports = HeapCallStore;

function HeapCallStore() {
	var calls = [];

	this.record = function record(thisBinding, callArguments, onExecuted) {
		calls.push({
			thisBinding: thisBinding, 
			callArguments : callArguments,
			onExecuted : onExecuted
		});
	};

	this.getCalls = function getCalls() {
		// Use slice to clone
		return calls.slice(0);
	};
}