import ComplexNumber from './ComplexNumber.class.mjs';
import { ValidType } from '@agadev/utils';
import { equals } from './functions.mjs';

export function isRealNumber(value) {
	return typeof value === 'number';
}
export function validRealNumber(value) {
	ValidType(value, isRealNumber);
}

export function isComplexNumber(value) {
	return value instanceof ComplexNumber;
}
export function validComplexNumber(value) {
	ValidType(value, isComplexNumber);
}

export function isLikeNumber(value) {
	return isRealNumber(value) || isComplexNumber(value);
}
export function validLikeNumber(value) {
	ValidType(value, isLikeNumber);
}

export function multiNumberFunction(fn) {
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
