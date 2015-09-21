module.exports = CallStore;

function CallStore() {
	var calls = [];

	this.record = function record(thisBinding, callArguments) {
		calls.push([thisBinding, callArguments]);
	};

	this.getCalls = function getCalls() {
		return calls.slice(0); // clone
	};
}