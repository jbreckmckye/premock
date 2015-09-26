# Premock
Store up commands for a function that doesn't yet exist, and run those commands once it does.

## What is this for?
Working on the web, we don't always have our JavaScript dependencies available at the time we'd ideally like to use them. Wouldn't it be nice if we could pretend that they exist, and call them all the same?

Well, with Premock, you can.

## Basic example

    let premocked = premock();

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

Premock stores up your calls until you can resolve it with a real function. Then it replays your original calls using that implementation. Subsequent calls go straight to the real function.

## Argument-passing

Premock can happily handle multiple arguments. It will also pass through the `this` binding available to the premock proxy function. Remember to use `bind` if you want to change that.

## Dealing with return values

If Premock is run in an environment with promises (that is, where `window.Promise` is not undefined), it will use them to construct a return value for premock calls. That promise will be resolved with the return value of the call.

    let premocked = premock();

    let promise = premocked('Kathy');
    promise.then(function(resolvedValue){
    	console.log(resolvedValue);
    });

    function greeter(name) {
    	return 'Hello, ' + name + '!';
    }

    premocked.resolve(greeter);
    // 'Hello, Kathy!' printed to console


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

	let premocked = premock(eventualFunction);

	premocked('Maximillian');

	// three seconds later, the console prints:
	// "Sorry about the delay, Maximillian"

## Using the library

Just take the `premock.js` file at the root of this project and include it in your deployed scripts. Note that it is not minified.

## [Feature request] Cross-page persistence

One thing that might be interesting is if premock could persist calls in localstorage or similar - so that calls could be premocked across entire pageviews! Obviously, this would only really work with functions that only had side effects, like making logging calls to a server. And the call arguments would have to be serializable. Let me know if you think it could be useful.