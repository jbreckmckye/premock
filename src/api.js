// Public exports
module.exports =    premock;
                    premock.withoutPersistence = premockWithoutPersistence;

var LaterFunction = require('./LaterFunction.js');
var HeapCallStore = require('./HeapCallStore.js');
var LocalCallStore = require('./LocalCallStore.js');
var createRouter = require('./createRouter.js');
var replayCalls = require('./replayCalls.js');
var canUseLocalStorage = require('./canUseLocalStorage.js');

function premock(name, promise) {
    if (name === undefined) {
        throw new Error('Premock: needs a storage ID key');
    }
    
    if (canUseLocalStorage() === false) {
        throw new Error('Premock: did not detect localStorage');
    }

    var callStore = new LocalCallStore(name.toString());
    return createPremocker(callStore, promise);
}

function premockWithoutPersistence(promise) {
	var callStore = new HeapCallStore();
	return createPremocker(callStore, promise);
}

function createPremocker(callStore, pendingImplementation) {
    var laterFunction = new LaterFunction();

    // Create a 'router' that will pass calls to either the laterFunction (if it exists), or the callStore (otherwise)
    var callRouter = createRouter(laterFunction, callStore);

    // Create a means to resolve the laterFunction
    callRouter.resolve = function resolvePremock(implementation) {
        laterFunction.resolve(implementation);
        replayCalls(callStore.getCalls(), implementation);
    };

    // We can resolve the laterFunction with a passed-in promise
    if (pendingImplementation && pendingImplementation.then) {
        pendingImplementation.then(callRouter.resolve);
    }

    return callRouter;
}
