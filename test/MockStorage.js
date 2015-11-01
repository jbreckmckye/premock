module.exports = MockStorage;

function MockStorage() {
    this.setItem = ()=> {};
    this.getItem = ()=> {};
    this.removeItem = ()=> {};
}