module.exports = replayCalls;

var defer = require('./defer.js');

function replayCalls(calls, implementation) {
	// We give each call its own event so that if one throws an exception, the others still run
	calls.forEach(function(call){
		defer(function(){
			implementation.apply(call.thisBinding, call.callArguments);
		});
	});
}