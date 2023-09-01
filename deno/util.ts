import type { RealNumber, LikeNumber } from './types.d.ts';
import ComplexNumber from './ComplexNumber.class.ts';
import { ValidType } from "https://deno.land/x/aga_util@1.0.0/validation.ts";
import { equals } from './functions.ts';

/**
 * The function checks if a value is a real number.
 * @param {unknown} value - The parameter "value" is of type "unknown", which means it can be any type.
 * @returns a boolean value.
 */
export function isRealNumber(value: unknown): value is RealNumber {
	return typeof value === 'number';
}
/**
 * The function "validRealNumber" checks if a value is a valid real number.
 * @param {RealNumber} value - The value parameter is of type RealNumber.
 */
export function validRealNumber(value: RealNumber): void {
	ValidType(value, isRealNumber);
}

/**
 * The function checks if a value is an instance of the ComplexNumber class.
 * @param {unknown} value - The parameter "value" is of type "unknown", which means it can be any type.
 * @returns a boolean value.
 */
export function isComplexNumber(value: unknown): value is ComplexNumber {
	return value instanceof ComplexNumber;
}
/**
 * The function checks if a given value is a valid complex number.
 * @param {ComplexNumber} value - The value parameter is of type ComplexNumber.
 */
export function validComplexNumber(value: ComplexNumber): void {
	ValidType(value, isComplexNumber);
}

/**
 * The function `isLikeNumber` checks if a value is either a real number or a complex number.
 * @param {unknown} value - The parameter "value" is of type "unknown", which means it can be any type.
 * @returns a boolean value.
 */
export function isLikeNumber(value: unknown): value is LikeNumber {
	return isRealNumber(value) || isComplexNumber(value);
}
/**
 * The function `validLikeNumber` checks if a value is of type `LikeNumber`.
 * @param {LikeNumber} value - The value parameter is of type LikeNumber.
 */
export function validLikeNumber(value: LikeNumber): void {
	ValidType(value, isLikeNumber);
}
type MultiNumber<Num extends LikeNumber> = Num | Num[];
type Item<Arr> = Arr extends (infer Item)[] ? Item : Arr;
/* The `multiNumberFunction` function is a generic function that takes one or two parameters and
returns an array of items. */
export function multiNumberFunction<X extends LikeNumber, R extends LikeNumber>(
	fn: (x: X) => R
): (x: MultiNumber<X>) => Item<R>[];
export function multiNumberFunction<
	X extends LikeNumber,
	Y extends LikeNumber,
	R extends LikeNumber | LikeNumber[]
>(fn: (x: X, y: Y) => R): (x: MultiNumber<X>, y: MultiNumber<Y>) => Item<R>[];

export function multiNumberFunction<
	X extends LikeNumber,
	Y extends LikeNumber,
	R extends LikeNumber | LikeNumber[]
>(fn: (x: X, y: Y) => R) {
	return (x: MultiNumber<X>, y: MultiNumber<Y>) => {
		const xArray = Array.isArray(x) ? x : [x];
		const yArray = Array.isArray(y) ? y : [y];
		const result: Item<R>[] = [];
		for (const xValue of xArray)
			for (const yValue of yArray) {
				const fnResult = fn(xValue, yValue);
				if (!Array.isArray(fnResult)) {
					const exist = result.find(value => equals(value, fnResult));
					if (!exist) result.push(fnResult as Item<R>);
				} else
					for (const item of fnResult) {
						const exist = result.find(value => equals(value, item));
						if (!exist) result.push(item as Item<R>);
					}
			}
		return result;
	};
}
