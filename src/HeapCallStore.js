module.exports = HeapCallStore;

function HeapCallStore() {
	var calls = [];

	this.record = function record(callArguments, thisBinding, onExecuted) {
		calls.push({
			callArguments : callArguments,
			thisBinding: thisBinding,
			onExecuted : onExecuted
		});
	};

	this.getCalls = function getCalls() {
		return calls;
	};
}