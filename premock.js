(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.premock = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
module.exports = FutureFunction;

function FutureFunction(fnPromise) {
	var realFunction = null;

	if(fnPromise && fnPromise.then) {
		fnPromise.then(function(fn){
			realFunction = fn;
		});
	}

	this.resolveImplementation = function(fn) {
		realFunction = fn;
	};

	this.getImplementation = function() {
		return realFunction;
	};
}
},{}],3:[function(require,module,exports){
module.exports = createProxy;

function createProxy(getImplementation, callStore) {
	return function premocked() {
		var args = Array.prototype.slice.call(arguments);
		var implementation = getImplementation();

		if (implementation) {
			implementation.apply(this, args);
		} else {
			callStore.record(this, args);
		}
	};
}
},{}],4:[function(require,module,exports){
module.exports = premock;

var FutureFunction = require('./FutureFunction.js');
var CallStore = require('./CallStore.js');
var createProxy = require('./createProxy.js');

function premock(promise) {
	var futureFunction = new FutureFunction(promise);
	var callStore = new CallStore();
	var proxy = createProxy(futureFunction.getImplementation, callStore);
	proxy.resolveImplementation = futureFunction.resolveImplementation;

	return proxy;
}
},{"./CallStore.js":1,"./FutureFunction.js":2,"./createProxy.js":3}]},{},[4])(4)
});