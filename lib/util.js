const { ValidType } = require('@agadev/utils');
const ComplexNumber = require('./ComplexNumber.class.js');
const { equals } = require('./functions.js');

function isRealNumber(value) {
	return typeof value === 'number';
}
module.exports.isRealNumber = isRealNumber;
function validRealNumber(value) {
	ValidType(value, isRealNumber);
}
module.exports.validRealNumber = validRealNumber;
function isComplexNumber(value) {
	return value instanceof ComplexNumber;
}
module.exports.isComplexNumber = isComplexNumber;
function validComplexNumber(value) {
	ValidType(value, isComplexNumber);
}
module.exports.validComplexNumber = validComplexNumber;
function isLikeNumber(value) {
	return isRealNumber(value) || isComplexNumber(value);
}
module.exports.isLikeNumber = isLikeNumber;
function validLikeNumber(value) {
	ValidType(value, isLikeNumber);
}
module.exports.validLikeNumber = validLikeNumber;
function multiNumberFunction(fn) {
	return (x, y) => {
		const xArray = Array.isArray(x) ? x : [x];
		const yArray = Array.isArray(y) ? y : [y];
		const result = [];
		for (const xValue of xArray)
			for (const yValue of yArray) {
				const fnResult = fn(xValue, yValue);
				if (!Array.isArray(fnResult)) {
					const exist = result.find(value => equals(value, fnResult));
					if (!exist) result.push(fnResult);
				} else
					for (const item of fnResult) {
						const exist = result.find(value => equals(value, item));
						if (!exist) result.push(item);
					}
			}
		return result;
	};
}
module.exports.multiNumberFunction = multiNumberFunction;
