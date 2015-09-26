(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.premock = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
module.exports = MaybeFunction;

function MaybeFunction(onResolve) {
	var that = this;
	var realFunction = null;

	this.resolveImplementation = function(fn) {
		if (realFunction === null) {
			realFunction = fn;
			onResolve(realFunction);
		}		
	};

	this.getImplementation = function() {
		return realFunction;
	};
}
},{}],3:[function(require,module,exports){
module.exports = createProxy;

// Ghetto dependency injection
createProxy._Promise = window.Promise || null;

function createProxy(getImplementation, callStore) {
	return function premocked() {
		var Promise = createProxy._Promise;

		var args = Array.prototype.slice.call(arguments);
		var implementation = getImplementation();
		var callPromise;
		var onRealCall;
		var callReturn;

		if (Promise) {
			callPromise = new Promise(function(resolve){
				onRealCall = resolve;
			});
		}

		if (implementation) {
			callReturn = implementation.apply(this, args);
			onRealCall(callReturn);
		} else {
			callStore.record(this, args, onRealCall);
		}

		return callPromise;
	};
}


},{}],4:[function(require,module,exports){
module.exports = defer;

function defer(fn) {
	window.setTimeout(fn, 0);
}
},{}],5:[function(require,module,exports){
module.exports = premock;

var MaybeFunction = require('./MaybeFunction.js');
var CallStore = require('./CallStore.js');
var createProxy = require('./createProxy.js');
var replayCalls = require('./replayCalls.js');

function premock(promise) {
	var maybeFunction = new MaybeFunction(onImplemented);
	var callStore = new CallStore();	
	var proxy = createProxy(maybeFunction.getImplementation, callStore);

	proxy.resolve = maybeFunction.resolveImplementation;
	if (promise && promise.then) {
		promise.then(maybeFuction.resolveImplementation);
	}

	return proxy;

	function onImplemented(implementation) {
		replayCalls(callStore.getCalls(), implementation);
	}
}
},{"./CallStore.js":1,"./MaybeFunction.js":2,"./createProxy.js":3,"./replayCalls.js":6}],6:[function(require,module,exports){
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
},{"./defer.js":4}]},{},[5])(5)
});