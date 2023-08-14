const ComplexNumber = require('./ComplexNumber.class.js');
const { eval_complex, default: Parser } = require('./Parser.class.js');
const fns = require('./functions.js');

module.exports = ComplexNumber;

Object.keys(fns).forEach(key => {
	module.exports[key] = fns[key];
});

module.exports.default = ComplexNumber;

module.exports.eval_complex = eval_complex;
module.exports.Parser = Parser;
