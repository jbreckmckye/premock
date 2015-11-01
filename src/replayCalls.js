module.exports = replayCalls;

// Ghetto dependency injection
replayCalls._defer = require('./defer.js');

function replayCalls(calls, implementation) {
	var defer = replayCalls._defer;

	// We give each call its own event so that if one throws an exception, the others still run
	calls.forEach(function(call){
		var result;
		var thisBinding = call.thisBinding || null; // Calls from previous pages will lack bindings
		defer(function(){
            // todo - there is a bug here, where a faulty set of params in localStorage will never clear, because onExecuted isn't called if the implementation throws an error

			result = implementation.apply(thisBinding, call.callArguments);
			if (call.onExecuted) {
                call.onExecuted(result);
            }
		});
	});
}