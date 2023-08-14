import type { RealNumber, LikeNumber } from './types.d.ts';
import ComplexNumber from './ComplexNumber.class.ts';
import { ValidType } from 'https://agacdn.onrender.com/AgaDev:utils@1.0.0/validation.ts';
import { equals } from './functions.ts';

export function isRealNumber(value: unknown): value is RealNumber {
	return typeof value === 'number';
}
export function validRealNumber(value: RealNumber): void {
	ValidType(value, isRealNumber);
}

export function isComplexNumber(value: unknown): value is ComplexNumber {
	return value instanceof ComplexNumber;
}
export function validComplexNumber(value: ComplexNumber): void {
	ValidType(value, isComplexNumber);
}

export function isLikeNumber(value: unknown): value is LikeNumber {
	return isRealNumber(value) || isComplexNumber(value);
}
export function validLikeNumber(value: LikeNumber): void {
	ValidType(value, isLikeNumber);
}
type MultiNumber<Num extends LikeNumber> = Num | Num[];
type Item<Arr> = Arr extends (infer Item)[] ? Item : Arr;
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
