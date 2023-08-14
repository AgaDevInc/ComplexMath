import {Inspecteable} from '@agadev/utils';
import Angle, { Radians } from './Angle.class.mjs';
import ComplexNumber from './ComplexNumber.class.mjs';
import { absolute, equals } from './functions.mjs';
import { validLikeNumber } from './util.mjs';

export default class Polar extends Inspecteable {
	constructor(magnitude, angle) {
		super();
		this.magnitude = magnitude;
		this.angle = angle;
	}
	toComplexNumber() {
		const theta = Radians.from(this.angle);
		const real = this.magnitude * Math.cos(theta.value);
		const imaginary = this.magnitude * Math.sin(theta.value);
		return ComplexNumber.from(real, imaginary);
	}
	static from(value) {
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
	static toComplexNumber(
		magnitude,
		angle,
		type = AngleType.radians
	) {
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

export function comparePolar(a, b) {
	if (a === b) return true;
	const aComplex = a.toComplexNumber();
	const bComplex = b.toComplexNumber();
	return equals(aComplex, bComplex);
}
