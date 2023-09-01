import Inspecteable from "https://deno.land/x/aga_util@1.0.0/Inspectable.class.ts";
import Angle, { Radians } from './Angle.class.ts';
import ComplexNumber from './ComplexNumber.class.ts';
import { absolute, equals } from './functions.ts';
import { LikeNumber, RealNumber } from './types.d.ts';
import { validLikeNumber } from './util.ts';

const enum AngleType {
	degrees = 'degrees',
	radians = 'radians',
}

/* The Polar class represents a complex number in polar form and provides methods for converting to a
complex number in rectangular form. */
export default class Polar extends Inspecteable {
	constructor(public magnitude: RealNumber, public angle: Angle) {
		super();
	}
	toComplexNumber(): ComplexNumber {
		const theta = Radians.from(this.angle);
		const real = this.magnitude * Math.cos(theta.value);
		const imaginary = this.magnitude * Math.sin(theta.value);
		return ComplexNumber.from(real, imaginary);
	}
	static from(value: LikeNumber): Polar {
		validLikeNumber(value);
		const [real, imaginary] = ComplexNumber.from(value);
		const magnitude = absolute(value);
		const alpha = Math.atan2(imaginary, real);
		const angle = new Radians(alpha);
		return new Polar(magnitude, angle);
	}
	toString() {
		return `${this.magnitude} ${this.angle}`;
	}
	static toComplexNumber(magnitude: RealNumber, angle: Angle): ComplexNumber;
	static toComplexNumber(
		magnitude: RealNumber,
		angle: RealNumber,
		type?: AngleType
	): ComplexNumber;
	static toComplexNumber(
		magnitude: RealNumber,
		angle: Angle | RealNumber,
		type = AngleType.radians
	): ComplexNumber {
		const theta =
			angle instanceof Angle
				? Radians.from(angle)
				: new Radians(
						type === AngleType.radians ? angle : (Math.PI * angle) / 180
				  );
		const real = magnitude * Math.cos(theta.value);
		const imaginary = magnitude * Math.sin(theta.value);
		return ComplexNumber.from(real, imaginary);
	}
}

/**
 * The function compares two polar numbers by converting them to complex numbers and checking if they
 * are equal.
 * @param {Polar} a - The parameter `a` is of type `Polar`, which represents a complex number in polar
 * form. It likely has properties such as `magnitude` and `angle` that define the polar coordinates of
 * the complex number.
 * @param {Polar} b - The parameter `b` is of type `Polar`.
 * @returns a boolean value.
 */
export function comparePolar(a: Polar, b: Polar): boolean {
	if (a === b) return true;
	const aComplex = a.toComplexNumber();
	const bComplex = b.toComplexNumber();
	return equals(aComplex, bComplex);
}
