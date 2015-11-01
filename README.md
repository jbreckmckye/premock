# Premock
Store up commands for a function you can't run yet, and dispatch them later when you can - even if that's one another pageview

## What is this for?
- "I want to run this function, but I can't guarantee it'll load before the user navigates away. Can I store the command up to be run later?"
- "I don't have this function loaded yet, but I'd like to call it as though it was, and execute it later"
- "I have something I need to run at some point, but I can't do it on this page, because I want to keep this page lightweight / wait for an SSL page / it does something with the next page"

Premock lets you handle all of these scenarios. It creates an 'ahead proxy' that stores up commands, putting them in localStorage in case the user refreshes the page. You can then resolve that proxy with an implementation, and premock will dispatch the stored commands against it.

## Basic example with cross-page persistence

    let premocked = premock('functionName'); // creates a 'proxy'

    premocked(1); // Neither of these do anything ...yet
    premocked(2);
    
    ~~~
    [REFRESH THE PAGE]
    ~~~
    
    let premocked = premock('functionName'); // you must pass the same key

    function printDouble(x) {
    	console.log(x * 2);
    }

    premocked.resolve(printDouble);
    // '2' printed to console
    // '4' printed to console

    premocked(3);
    // '6' printed to console

Premock stores up your calls until you can resolve it with a real function. Then it replays your original calls using that implementation. Subsequent calls go straight to the real function.

## Without cross-page persistence

If you don't want to store calls in localStorage, for whatever reason, you can use `premock.withoutPersistence`.

    let premocked = premock.withoutPersistence(); // no key required
    
    premocked(1); // Neither of these do anything ...yet
    premocked(2);
    
    function printDouble(x) {
        console.log(x * 2);
    }
    
    premocked.resolve(printDouble);
    // '2' printed to console
    // '4' printed to console
    
    premocked(3);
    // '6' printed to console

## Argument-passing

You can pass any number of arguments when calling the proxy.

If you are using cross-page persistence, your arguments will need to be serializable. If you pass arguments with circular references, you may get a `JSON.stringify` exception.

If you are using `premock.withoutPersistence`, premock will preserve the proxy's `this` binding, which you can control with the `bind` method.

## Dealing with return values

If Premock is run in an environment with promises (that is, where `window.Promise` is not undefined), it will use them to construct a return value for premock calls. If the premock is resolved with an implementation in _the same pageview_, those promises will be resolved with the return value of the real function call.
    
    let premocked = premock('foo');

    let promise = premocked('Kathy');
    promise.then(function(resolvedValue){
        // Print the promise's resolved value to the console
    	console.log(resolvedValue);
    });

    function greeter(name) {
    	return 'Hello, ' + name + '!';
    }

    premocked.resolve(greeter);
    // 'Kathy' is passed to greeter...
    // Greeter returns 'Hello, Kathy!'...
    // Premock resolves 'promise' with 'Hello, Kathy!'...
    // 'Hello, Kathy!' is printed to the console

If Premock is run in an environment _without_ promises, mocks will return `undefined` until the implementation is resolved - at which point it'll just pass the results back on.

### Error handling

If replaying any function calls throws an exception, premock will not swallow the error (meaning - you will see it in the console), and it will not stop dispatching the other calls.

## Resolving with promises

You don't have to call the `resolve` method yourself. You can pass premock a promise which will effectively do it for you. When that promise resolves, premock will take the resolved value as a function to use as an implementation.

	let eventualFunction = new Promise(function(resolve, reject){		
		window.setTimeout(function(){
			resolve(apologizeForLateness);
		}, 3000);

		function apologizeForLateness(name) {
			console.log('Sorry about the delay, ' + name);
		}
	});

	let premocked = premock('foo', eventualFunction);

	premocked('Maximillian');

	// three seconds later, the console prints:
	// "Sorry about the delay, Maximillian"
	
When calling `premock.withoutPersistence`, the resolver promise is the first argument.

## Using the library

Just take the `premock.js` file at the root of this project and include it in your deployed scripts. Note that it is not minified.