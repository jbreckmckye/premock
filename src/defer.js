module.exports = defer;

function defer(fn) {
	window.setTimeout(fn, 0);
}