import { Radians } from './Angle.class.mjs';
import Polar from './Polar.class.mjs';
import ComplexNumber from './ComplexNumber.class.mjs';
import { I, PI } from './constants.mjs';
import { validLikeNumber } from './utils.mjs';

function roundDecimals(value, decimals = 0) {
	const multiplier = Math.pow(10, decimals);
	const round = Math.round(value * multiplier);
	return round / multiplier;
}

//#region Arithmetic functions
export function absolute(x) {
	validLikeNumber(x);
	if (typeof x === 'number') return Math.abs(x);
	// Absolute value is the distance from the origin (0,0)
	// c^2 = a^2 + b^2
	// c = sqrt(a^2 + b^2)
	const c2 = x.real * x.real + x.imaginary * x.imaginary;
	const c = Math.sqrt(c2);
	return c;
}

/** x±y */
export function plusMinus(x, y) {
	validLikeNumber(x);
	validLikeNumber(y);

	const plus = add(x, y);
	const minus = subtract(x, y);

	return [plus, minus];
}

export function add(x, y) {
	validLikeNumber(x);
	validLikeNumber(y);
	if (typeof x === 'number')
		if (typeof y === 'number') return ComplexNumber.from(x + y);
		else return ComplexNumber.from(x + y.real, y.imaginary);
	// x instanceof ComplexNumber
	else if (typeof y === 'number')
		return ComplexNumber.from(x.real + y, x.imaginary);
	else return ComplexNumber.from(x.real + y.real, x.imaginary + y.imaginary);
}
export function subtract(x,y) {
	validLikeNumber(x);
	validLikeNumber(y);
	if (typeof x === 'number')
		if (typeof y === 'number') return ComplexNumber.from(x - y);
		else return ComplexNumber.from(x - y.real, -y.imaginary);
	// x instanceof ComplexNumber
	else if (typeof y === 'number')
		return ComplexNumber.from(x.real - y, x.imaginary);
	else return ComplexNumber.from(x.real - y.real, x.imaginary - y.imaginary);
}
export function multiply(x, y) {
	validLikeNumber(x);
	validLikeNumber(y);

	if (typeof x === 'number')
		if (typeof y === 'number') return ComplexNumber.from(x * y);
		else return ComplexNumber.from(x * y.real, x * y.imaginary);
	// x instanceof ComplexNumber
	else if (typeof y === 'number')
		return ComplexNumber.from(x.real * y, x.imaginary * y);
	else
		return ComplexNumber.from(
			x.real * y.real - x.imaginary * y.imaginary,
			x.real * y.imaginary + x.imaginary * y.real
		);
}
export function divide(x, y) {
	validLikeNumber(x);
	validLikeNumber(y);
	if (typeof x === 'number') x = ComplexNumber.from(x);
	if (typeof y === 'number') y = ComplexNumber.from(y);

	// Denominator: c^2 + d^2
	const denominator = y.real * y.real + y.imaginary * y.imaginary;

	// Real part: (a * c + b * d) / (c^2 + d^2)
	const real = (x.real * y.real + x.imaginary * y.imaginary) / denominator;

	// Imaginary part: (b * c - a * d) / (c^2 + d^2)
	const imaginary = (x.imaginary * y.real - x.real * y.imaginary) / denominator;

	return ComplexNumber.from(real, imaginary);
}
export function modulo(x, y) {
	validLikeNumber(x);
	validLikeNumber(y);

	const quotient = divide(x, y);
	const quotientFloor = floor(quotient);
	return subtract(x, multiply(quotientFloor, y));
}
export function exp(x) {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(Math.exp(x));

	const real = Math.exp(x.real) * Math.cos(x.imaginary);
	const imaginary = Math.exp(x.real) * Math.sin(x.imaginary);
	return ComplexNumber.from(real, imaginary);
}
export function log(x) {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(Math.log(x));

	// Real: ln(|x|)
	const real = Math.log(Math.sqrt(x.real * x.real + x.imaginary * x.imaginary));
	// Imaginary: arg(x)
	const imaginary = Math.atan2(x.imaginary, x.real);
	return ComplexNumber.from(real, imaginary);
}
export function power(
	base,
	exponent = 2
) {
	validLikeNumber(base);
	validLikeNumber(exponent);

	// (a+bi)^(c+di)
	const polarBase = Polar.from(base);
	// r = |a+bi|
	const r = polarBase.magnitude;
	// theta = arg(a+bi)
	const theta = Radians.from(polarBase.angle);
	const [c, d] = ComplexNumber.from(exponent);

	// (r * e^[i*theta])^(c+di)
	// (r * e^[i*theta])^c * (r * e^[i*theta])^di
	// r^c * e^[i*theta*c] * r^di * e^[-d*theta]
	// r^c * e^[i*theta*c] * e^[di*ln(r)] * e^[-d*theta]
	// r^c * e^[i{c*theta + d*ln(r)} - d*theta]
	// e^[c*ln(r)] * e^[i{c*theta + d*ln(r)} - d*theta]
	// e^[c*ln(r) + i{c*theta + d*ln(r)} - d*theta]

	// x = c*ln(r) + i{c*theta + d*ln(r)} - d*theta
	//     c*ln(r)*i^4 + i{c*theta + d*ln(r)} + d*theta*i^2
	//     i{ c*ln(r)*i^3 + c*theta + d*ln(r) + d*theta*i }
	//     i{ -1*c*ln(r)*i + c*theta + d*ln(r) + d*theta*i }

	// y = x/i
	// 	   -1*c*ln(r)*i + c*theta + d*ln(r) + d*theta*i
	// 	   c*theta + d*ln(r) + [d*theta - c*ln(r)]i

	// e^x = e^iy = cos(y) + i*sin(y)

	const lnr = Math.log(r);

	const clnr = c * lnr;
	const ctheta = c * theta.value;
	const dlnr = d * lnr;
	const dtheta = d * theta.value;

	const yRe = ctheta + dlnr;
	const yIm = dtheta - clnr;
	const y = new ComplexNumber(yRe, yIm);

	const cosY = cos(y);
	const sinY = sin(y);

	const isinY = multiply(I, sinY);

	return add(cosY, isinY);
}
export function square(x, y = 2) {
	validLikeNumber(x);
	validLikeNumber(y);

	return power(x, divide(1, y));
}
square.multidata = function square (
	base,
	index = 2
) {
	validLikeNumber(base);
	validLikeNumber(index);
	const maxData = 100;
	const data = [];

	// (a+bi)^(c+di)
	const polarBase = Polar.from(base);
	// r = |a+bi|
	const r = polarBase.magnitude;
	// theta = arg(a+bi)
	const θ = Radians.from(polarBase.angle);

	const r_n = power(r, divide(1, index));

	for (let k = 0; k < maxData; k++) {
		const angle = divide(θ.value + (/* 360° */2 * PI * k), index)

		const cosY = cos(angle);
		const sinY = sin(angle);

		const isinY = multiply(I, sinY);

		const cos_isin = add(cosY, isinY);

		const value = multiply(r_n, cos_isin);
		const exists = data.some((v) => equals(v, value));
		if (exists) break;
		data.push(value);
	}

	return data;
};
//#endregion

//#region Trigonometric functions
export function sin(x) {
	validLikeNumber(x);

	if (typeof x === 'number') return ComplexNumber.from(Math.sin(x));

	// Real part: sin(a) * cosh(b)
	const real = Math.sin(x.real) * Math.cosh(x.imaginary);

	// Imaginary part: cos(a) * sinh(b)
	const imaginary = Math.cos(x.real) * Math.sinh(x.imaginary);

	return ComplexNumber.from(real, imaginary);
}
export function cos(x) {
	validLikeNumber(x);

	if (typeof x === 'number') return ComplexNumber.from(Math.cos(x));

	// Real part: cos(a) * cosh(b)
	const real = Math.cos(x.real) * Math.cosh(x.imaginary);

	// Imaginary part: -sin(a) * sinh(b)
	const imaginary = -Math.sin(x.real) * Math.sinh(x.imaginary);

	return ComplexNumber.from(real, imaginary);
}
export function tan(x) {
	validLikeNumber(x);

	if (typeof x === 'number') return ComplexNumber.from(Math.tan(x));

	// Calculate sin(x) and cos(x)
	const sinX = sin(x);
	const cosX = cos(x);

	// Divide sin(x) by cos(x)
	return divide(sinX, cosX);
}
export function cot(x) {
	validLikeNumber(x);

	// Calculate cos(x) and sin(x)
	const cosX = cos(x);
	const sinX = sin(x);

	// Divide cos(x) by sin(x)
	return divide(cosX, sinX);
}
export function sec(x) {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(1 / Math.cos(x));

	// Calculate cos(x)
	const cosX = cos(x);

	// Take the reciprocal of cos(x)
	return divide(1, cosX);
}
export function csc(x) {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(1 / Math.sin(x));

	// Calculate sin(x)
	const sinX = sin(x);

	// Take the reciprocal of sin(x)
	return divide(1, sinX);
}
//#endregion

//#region Program functions
export function equals(x, y) {
	if (typeof x === 'number' && typeof y === 'number') return x === y;
	if (typeof x === 'number' && y instanceof ComplexNumber)
		return x === y.real && y.imaginary === 0;
	if (x instanceof ComplexNumber && typeof y === 'number')
		return x.real === y && x.imaginary === 0;
	if (x instanceof ComplexNumber && y instanceof ComplexNumber)
		return x.real === y.real && x.imaginary === y.imaginary;
	return false;
}
export function negative(x) {
	if (typeof x === 'number') return ComplexNumber.from(-x);
	return ComplexNumber.from(-x.real, -x.imaginary);
}
export function round(x, y = 0) {
	validLikeNumber(x);
	validLikeNumber(y);

	// If y is a complex number, use its real part
	if (y instanceof ComplexNumber) y = y.real;

	if (typeof x === 'number') return ComplexNumber.from(roundDecimals(x, y));
	// Round the real and imaginary parts separately
	const real = roundDecimals(x.real, y);
	const imaginary = roundDecimals(x.imaginary, y);
	return ComplexNumber.from(real, imaginary);
}
export function floor(x) {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(Math.floor(x));
	// Floor the real and imaginary parts separately
	const real = Math.floor(x.real);
	const imaginary = Math.floor(x.imaginary);
	return ComplexNumber.from(real, imaginary);
}
export function isInt(x) {
	validLikeNumber(x);
	if (typeof x === 'number') return Number.isInteger(x);
	return Number.isInteger(x.real) && x.imaginary === 0;
}
//#endregion
