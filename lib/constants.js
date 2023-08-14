const ComplexNumber = require('./ComplexNumber.class.js');

module.exports.PI = Math.PI;
module.exports.EULER = Math.E;
module.exports.I = ComplexNumber.from(0, 1);

module.exports.π = module.exports.PI;
module.exports.e = module.exports.EULER;
module.exports.i = module.exports.I;