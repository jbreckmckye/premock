module.exports = canUseLocalStorage;

// Expose dependencies for testing
canUseLocalStorage._localStorage = window.localStorage;

function canUseLocalStorage() {
    var storage = canUseLocalStorage._localStorage;
    return !!storage && canStoreItems();

    function canStoreItems() {
        // This can fail if browser security settings give storage a zero quota (i.e. Safari)

        if (storage.length) {
            return true; // items are stored, so storage must have a quota
        } else {
            try {
                testStorage();
            } catch (e) {
                return false;
            }
            // If successful...
            return true;
        }

        function testStorage() {
            storage.setItem('premock-feature-test', 'abc');
            storage.removeItem('premock-feature-test');
        }
    }
}