module.exports = replayCalls;

// Ghetto dependency injection
replayCalls._defer = require('./defer.js');

function replayCalls(calls, implementation) {
	var defer = replayCalls._defer;

	// We give each call its own event so that if one throws an exception, the others still run
	calls.forEach(function(call){
		var result;
		defer(function(){
			result = implementation.apply(call.thisBinding, call.callArguments);
			call.onExecuted(result);
		});
	});
}