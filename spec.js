describe('premock', ()=>{

    describe('The empty double', ()=> {
        const double = premock();

        it('The double is a callable function', ()=> {
            function callDouble() {
                double();
            }
            expect(callDouble).not.toThrow();
        });

        xit('The double has a hydrate method', ()=>{});

        xit('The double has a clearHistory method', ()=>{});

    });


    describe('The hydrated double', ()=> {

        xit('Now invokes the implementation when called', ()=> {});

        xit('Invokes the implementation with the correct arguments', ()=>{});

    });


    describe('Creating a double with a hydrator promise', ()=> {

        xit('Resolving the promise hydrates the double with the result', ()=>{});

    })


    describe('Passing calls from the empty to the hydrated double', ()=> {

        xit('For every time the empty double was called, the implementation is now called again', ()=>{});

        xit('Arguments passed to the empty double are now passed to the implementation', ()=>{});

        xit('If a passed call throws an exception, we log it and continue passing the calls', ()=>{});

    });


    describe('The clearHistory method', ()=> {

        xit('Stops previous calls being forwarded to the implementation', ()=>{});

    });


    describe('A double called with a persistence key', ()=> {

        xit('Records calls to the empty double in local storage', ()=>{});

        xit('Throws an exception if it cannot store the call', ()=>{});

        xit('A double created with the same key later will pass the calls to the implementation once hydrated', ()=>{});

        xit('The clearHistory method clears the local store record, but nothing else', ()=>{});

    });

});