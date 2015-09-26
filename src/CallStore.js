module.exports = CallStore;

function CallStore() {
	var calls = [];

	this.record = function record(thisBinding, callArguments, onExecuted) {
		calls.push({
			thisBinding: thisBinding, 
			callArguments : callArguments,
			onExecuted : onExecuted
		});
	};

	this.getCalls = function getCalls() {
		return calls.slice(0); // clone
	};
}