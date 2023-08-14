import { FOREGROUND } from 'https://agacdn.onrender.com/AgaDev:colors@1.0.0/';
import Inspecteable from 'https://agacdn.onrender.com/AgaDev:utils@1.1.0/Inspectable.class.ts';
import type { LikeNumber } from "./types.d.ts";
const PRECISION = 14;
const MIDDLE_PRECISION = Math.round(PRECISION/2);
const EPSILON = Number(`1e-${PRECISION}`);
function roundDecimals(value: number, decimals = 0) {
	if(typeof value !== 'number') throw new Error('Invalid value')
	if(typeof decimals !== 'number') throw new Error('Invalid decimals')
	const multiplier = Math.pow(10, decimals);
	const round = Math.round(value * multiplier);
	return round / multiplier;
}

function ConvertToFraction(number:number, tolerance = 1e-6):string {
	let numerator = 1;
	let denominator = 1;

	while (Math.abs(number - Math.round(number)) > tolerance) {
		number *= 10;
		numerator *= 10;
	}

	denominator = numerator;
	numerator = Math.round(number);

	const gcd = GreatestCommonDivisor(numerator, denominator);
	numerator /= gcd;
	denominator /= gcd;

	return `${numerator}/${denominator}`;
}
function GreatestCommonDivisor(a:number, b:number):number {
	if (b === 0) {
		return a;
	}

	return GreatestCommonDivisor(b, a % b);
}
function useConsts(val:number):string{
	if(val%Math.PI === 0)return `${val/Math.PI === 1 ? '' : val/Math.PI}π`
	if(val%Math.E === 0)return `${val/Math.E === 1 ? '' : val/Math.E}e`
	if(val%(Math.PI*Math.E) === 0)return `${val/(Math.PI*Math.E) === 1 ? '' : val/(Math.PI*Math.E)}πe`;
	return `${val}`
}

export default class ComplexNumber extends Inspecteable {
	protected toConsoleColor = FOREGROUND.YELLOW
	constructor(public real: number = 0, public imaginary: number = 0) {
		super();
	}
	toFraction(){
		const real = ConvertToFraction(this.real);
		const imaginary = ConvertToFraction(this.imaginary);
		if(this.imaginary === 0) return real;
		else if(this.real === 0) return `(${imaginary})i`;
		else return `${real} + (${imaginary})i`;
	}
	[Symbol.iterator] = function* (this: ComplexNumber) {
		yield this.real;
		yield this.imaginary;
	}
	valueOf(){
		if(this.imaginary === 0) return this.real;
		else return this.toString();
	}
	toJSON = this.toString;
	toString() {
		const parts = ['0', '+', '0i'];
		if (this.real !== 0) parts[0] = useConsts(this.real);
		else parts[0] = parts[1] = '';

		if (this.imaginary === 0) {
			parts[1] = parts[2] = '';
		} else if (Math.abs(this.imaginary) === 1) parts[2] = 'i';
		else parts[2] = `${useConsts(Math.abs(this.imaginary))}i`;

		if (this.imaginary < 0) parts[1] = '-';



		return parts.join('') || '0';
	}
	[Symbol.hasInstance](instance: unknown) {
		if(typeof instance !== 'object') return false;
		if(instance === null) return false;
		if(!('real' in instance)) return false;
		if(!('imaginary' in instance)) return false;
		return true;
	}
	static NaN: ComplexNumber;
	static Infinity: ComplexNumber;
	static NegativeInfinity: ComplexNumber;
	static Zero: ComplexNumber;
	static One: ComplexNumber;
	static Two: ComplexNumber;
	static E: ComplexNumber;
	static Pi: ComplexNumber;
	static I: ComplexNumber;
	static One_Two: ComplexNumber;

	static from(value: LikeNumber, imaginary?: number): ComplexNumber
	static from(value: ComplexNumber): ComplexNumber
	static from(value: LikeNumber, imaginary = 0) {
		if(value instanceof ComplexNumber) return ComplexNumber.from(value.real, value.imaginary);
		if(typeof value !== 'number') throw new Error('Invalid value')
		if(typeof imaginary !== 'number') throw new Error('Invalid imaginary')

		if (Math.abs(value) < EPSILON) value = 0;
		if (Math.abs(imaginary) < EPSILON) imaginary = 0;

		const a = Number(value.toPrecision(PRECISION));
		const b = Number(value.toPrecision(MIDDLE_PRECISION));
		if (a === b) value = roundDecimals(value, PRECISION-2);

		const c = parseFloat(imaginary.toPrecision(PRECISION));
		const d = parseFloat(imaginary.toPrecision(MIDDLE_PRECISION));
		if (c === d) imaginary = roundDecimals(imaginary, PRECISION-2);

		if (!ComplexNumber.NaN) ComplexNumber.NaN = new ComplexNumber(NaN);

		if (!ComplexNumber.Infinity) ComplexNumber.Infinity = new ComplexNumber(Infinity);
		if (!ComplexNumber.NegativeInfinity) ComplexNumber.NegativeInfinity = new ComplexNumber(-Infinity);
		if (!ComplexNumber.Zero) ComplexNumber.Zero = new ComplexNumber(0);
		if (!ComplexNumber.One) ComplexNumber.One = new ComplexNumber(1);
		if (!ComplexNumber.Two) ComplexNumber.Two = new ComplexNumber(2);
		if (!ComplexNumber.E) ComplexNumber.E = new ComplexNumber(Math.E);
		if (!ComplexNumber.Pi) ComplexNumber.Pi = new ComplexNumber(Math.PI);
		if (!ComplexNumber.I) ComplexNumber.I = new ComplexNumber(0, 1);
		if (!ComplexNumber.One_Two) ComplexNumber.One_Two = new ComplexNumber(1 / 2);

		if (ComplexNumber.isNaN(value) || ComplexNumber.isNaN(imaginary)) return ComplexNumber.NaN;

		if (value === Infinity) return ComplexNumber.Infinity;
		if (value === -Infinity) return ComplexNumber.NegativeInfinity;

		if (imaginary === Infinity) return ComplexNumber.Infinity;
		if (imaginary === -Infinity) return ComplexNumber.NegativeInfinity;

		if (value === 0 && imaginary === 0) return ComplexNumber.Zero;
		if (value === 1 && imaginary === 0) return ComplexNumber.One;
		if (value === 2 && imaginary === 0) return ComplexNumber.Two;
		if (value === Math.E && imaginary === 0) return ComplexNumber.E;
		if (value === Math.PI && imaginary === 0) return ComplexNumber.Pi;
		if (value === 0 && imaginary === 1) return ComplexNumber.I;
		if (value === 1 / 2 && imaginary === 0) return ComplexNumber.One_Two;

		return new ComplexNumber(value, imaginary);
	}
	static isNaN(value: number): boolean {
		return value !== 0 && !value;
	}
}