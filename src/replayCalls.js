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
			var errors;
			try {
			    result = implementation.apply(thisBinding, call.callArguments);
			} catch (e) {
			    errors = e;
			}
			
			if (call.onExecuted) {
                            call.onExecuted(result);
                        }
                        
                        if (errors) {
                            throw errors;
                        }
		});
	});
}
