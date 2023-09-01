import { Radians } from './Angle.class.ts';
import Polar from './Polar.class.ts';
import ComplexNumber from './ComplexNumber.class.ts';
import { I, PI } from './constants.ts';
import { LikeNumber, RealNumber } from './types.d.ts';
import { validLikeNumber } from './util.ts'

function roundDecimals(value: number, decimals = 0) {
	const multiplier = Math.pow(10, decimals);
	const round = Math.round(value * multiplier);
	return round / multiplier;
}

//#region Arithmetic functions
/**
 * The function calculates the absolute value of a number, whether it is a real number or a complex
 * number.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept either
 * a number or an object with `real` and `imaginary` properties.
 * @returns the absolute value of the input number. If the input is a real number, it returns the
 * absolute value using the Math.abs() function. If the input is a complex number, it calculates the
 * absolute value as the distance from the origin (0,0) using the formula c = sqrt(a^2 + b^2), where a
 * is the real part and b is the
 */
export function absolute(x: LikeNumber): RealNumber {
	validLikeNumber(x);
	if (typeof x === 'number') return Math.abs(x);
	// Absolute value is the distance from the origin (0,0)
	// c^2 = a^2 + b^2
	// c = sqrt(a^2 + b^2)
	const c2 = x.real * x.real + x.imaginary * x.imaginary;
	const c = Math.sqrt(c2);
	return c;
}

/**
 * The `plusMinus` function takes two numbers and returns an array containing their sum and difference
 * as complex numbers.
 * @param {LikeNumber} x - A number or a complex number.
 * @param {LikeNumber} y - The parameter `y` is a number or a complex number.
 * @returns An array of two ComplexNumber objects. The first element of the array is the result of
 * adding x and y, and the second element is the result of subtracting y from x.
 */
export function plusMinus(x: LikeNumber, y: LikeNumber): ComplexNumber[] {
	validLikeNumber(x);
	validLikeNumber(y);

	const plus = add(x, y);
	const minus = subtract(x, y);

	return [plus, minus];
}

/**
 * The function "add" takes two numbers or complex numbers as input and returns their sum as a complex
 * number.
 * @param {LikeNumber} x - The parameter `x` is a value that can be either a number or a complex
 * number.
 * @param {LikeNumber} y - The parameter `y` is a value of type `LikeNumber`.
 * @returns a ComplexNumber.
 */
export function add(x: LikeNumber, y: LikeNumber): ComplexNumber {
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
/**
 * The function subtracts two numbers, either real or complex, and returns the result as a complex
 * number.
 * @param {LikeNumber} x - The parameter `x` is a value of type `LikeNumber`, which means it can be
 * either a number or an instance of the `ComplexNumber` class.
 * @param {LikeNumber} y - The parameter `y` is a number or a complex number.
 * @returns a ComplexNumber object.
 */
export function subtract(x: LikeNumber, y: LikeNumber): ComplexNumber {
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
/**
 * The function multiplies two numbers, which can be either real numbers or complex numbers, and
 * returns the result as a complex number.
 * @param {LikeNumber} x - The parameter `x` is a value of type `LikeNumber`, which means it can be
 * either a number or a `ComplexNumber` object.
 * @param {LikeNumber} y - The parameter `y` is a number or a complex number.
 * @returns a ComplexNumber.
 */
export function multiply(x: LikeNumber, y: LikeNumber): ComplexNumber {
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
/**
 * The function divides two complex numbers and returns the result.
 * @param {LikeNumber} x - The parameter `x` represents the numerator of the division operation. It can
 * be either a number or a complex number.
 * @param {LikeNumber} y - The parameter `y` represents the divisor in the division operation. It can
 * be either a number or a complex number.
 * @returns a ComplexNumber object.
 */
export function divide(x: LikeNumber, y: LikeNumber): ComplexNumber {
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
/**
 * The modulo function calculates the remainder when dividing two numbers.
 * @param {LikeNumber} x - A number or a complex number.
 * @param {LikeNumber} y - The parameter `y` represents the divisor in the modulo operation. It is of
 * type `LikeNumber`, which means it can be any value that can be converted to a number.
 * @returns the remainder of dividing `x` by `y` as a `ComplexNumber`.
 */
export function modulo(x: LikeNumber, y: LikeNumber): ComplexNumber {
	validLikeNumber(x);
	validLikeNumber(y);

	const quotient = divide(x, y);
	const quotientFloor = floor(quotient);
	return subtract(x, multiply(quotientFloor, y));
}
/**
 * The `exp` function calculates the exponential value of a given number or complex number.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept either
 * a `number` or a `ComplexNumber`.
 * @returns a ComplexNumber.
 */
export function exp(x: LikeNumber): ComplexNumber {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(Math.exp(x));

	const real = Math.exp(x.real) * Math.cos(x.imaginary);
	const imaginary = Math.exp(x.real) * Math.sin(x.imaginary);
	return ComplexNumber.from(real, imaginary);
}
/**
 * The log function calculates the natural logarithm of a number, either a real number or a complex
 * number.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept either
 * a `number` or a `ComplexNumber` object.
 * @returns a complex number.
 */
export function log(x: LikeNumber) {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(Math.log(x));

	// Real: ln(|x|)
	const real = Math.log(Math.sqrt(x.real * x.real + x.imaginary * x.imaginary));
	// Imaginary: arg(x)
	const imaginary = Math.atan2(x.imaginary, x.real);
	return ComplexNumber.from(real, imaginary);
}
/**
 * The `power` function calculates the result of raising a complex number to a given exponent.
 * @param {LikeNumber} base - The `base` parameter represents the base number of the power operation.
 * It can be any number or complex number.
 * @param {LikeNumber} [exponent=2] - The `exponent` parameter represents the power to which the `base`
 * number will be raised. By default, it is set to 2, meaning the `base` number will be squared.
 * However, you can provide any number as the `exponent` to raise the `base` number
 * @returns a ComplexNumber, which represents the result of raising the base to the exponent.
 */
export function power(
	base: LikeNumber,
	exponent: LikeNumber = 2
): ComplexNumber {
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
/**
 * The function calculates the square root of a number raised to a given power.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept any
 * value that can be converted to a number. This includes numbers, strings that represent numbers, and
 * objects that have a `valueOf` method that returns a number.
 * @param {LikeNumber} [y=2] - The parameter `y` is a number that defaults to 2 if no value is
 * provided.
 * @returns a complex number.
 */
export function square(x: LikeNumber, y: LikeNumber = 2): ComplexNumber {
	validLikeNumber(x);
	validLikeNumber(y)

	return power(x, divide(1, y));
}
square.multidata = /**
 * The function "square" calculates the square root of a complex number.
 * @param {LikeNumber} base - The `base` parameter represents the complex number
 * that you want to calculate the square root of. It can be any number or expression
 * that can be interpreted as a complex number, such as a real number, imaginary
 * number, or a combination of both.
 * @param {LikeNumber} [index=2] - The `index` parameter represents the power to
 * which the `base` number will be raised. By default, it is set to 2, which means
 * the function will calculate the square of the `base` number. However, you can
 * also provide a different value for `index` if you want
 * @returns The function `square` returns an array of `ComplexNumber` objects.
 */
function square (
	base: LikeNumber,
	index: LikeNumber = 2
): ComplexNumber[] {
	validLikeNumber(base);
	validLikeNumber(index)
	const maxData = 100;
	const data: ComplexNumber[] = [];

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
/**
 * The function calculates the sine of a number, which can be either a real number or a complex number.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept either
 * a `number` or a `ComplexNumber`.
 * @returns a complex number.
 */
export function sin(x: LikeNumber): ComplexNumber {
	validLikeNumber(x);

	if (typeof x === 'number') return ComplexNumber.from(Math.sin(x));

	// Real part: sin(a) * cosh(b)
	const real = Math.sin(x.real) * Math.cosh(x.imaginary);

	// Imaginary part: cos(a) * sinh(b)
	const imaginary = Math.cos(x.real) * Math.sinh(x.imaginary);

	return ComplexNumber.from(real, imaginary);
}
/**
 * The function calculates the cosine of a complex number.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept either
 * a `number` or a `ComplexNumber`.
 * @returns a ComplexNumber.
 */
export function cos(x: LikeNumber): ComplexNumber {
	validLikeNumber(x);

	if (typeof x === 'number') return ComplexNumber.from(Math.cos(x));

	// Real part: cos(a) * cosh(b)
	const real = Math.cos(x.real) * Math.cosh(x.imaginary);

	// Imaginary part: -sin(a) * sinh(b)
	const imaginary = -Math.sin(x.real) * Math.sinh(x.imaginary);

	return ComplexNumber.from(real, imaginary);
}
/**
 * The function calculates the tangent of a given number, which can be either a real number or a
 * complex number.
 * @param {LikeNumber} x - The parameter `x` is a number or a complex number.
 * @returns a ComplexNumber.
 */
export function tan(x: LikeNumber): ComplexNumber {
	validLikeNumber(x);

	if (typeof x === 'number') return ComplexNumber.from(Math.tan(x));

	// Calculate sin(x) and cos(x)
	const sinX = sin(x);
	const cosX = cos(x);

	// Divide sin(x) by cos(x)
	return divide(sinX, cosX);
}
/**
 * The `cot` function calculates the cotangent of a given number.
 * @param {LikeNumber} x - The parameter `x` is a number or a value that can be converted to a number.
 * It can be any valid numeric value, such as a number literal, a variable containing a number, or an
 * expression that evaluates to a number.
 * @returns the cotangent of the input number.
 */
export function cot(x: LikeNumber): ComplexNumber {
	validLikeNumber(x);

	// Calculate cos(x) and sin(x)
	const cosX = cos(x);
	const sinX = sin(x);

	// Divide cos(x) by sin(x)
	return divide(cosX, sinX);
}
/**
 * The function `sec` calculates the secant of a given number, either as a real number or as a complex
 * number.
 * @param {LikeNumber} x - The parameter `x` represents the input value for which we want to calculate
 * the secant function. It can be any number or a complex number.
 * @returns the reciprocal of the secant of the input number.
 */
export function sec(x: LikeNumber): ComplexNumber {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(1 / Math.cos(x));

	// Calculate cos(x)
	const cosX = cos(x);

	// Take the reciprocal of cos(x)
	return divide(1, cosX);
}
/**
 * The function `csc` calculates the cosecant of a given number or complex number.
 * @param {LikeNumber} x - The parameter `x` represents a number or a complex number.
 * @returns a ComplexNumber.
 */
export function csc(x: LikeNumber): ComplexNumber {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(1 / Math.sin(x));

	// Calculate sin(x)
	const sinX = sin(x);

	// Take the reciprocal of sin(x)
	return divide(1, sinX);
}
//#endregion

//#region Program functions

/**
 * The function `lessThan` compares two numbers or complex numbers and returns true if the first number
 * is less than the second number.
 * @param {LikeNumber} x - The parameter `x` is a value that can be of type `number` or an object with
 * properties `real` and `imaginary` representing a complex number.
 * @param {LikeNumber} y - The parameter `y` represents a number or an object with properties `real`
 * and `imaginary` that represent the real and imaginary parts of a complex number.
 * @returns a boolean value, which indicates whether the first parameter `x` is less than the second
 * parameter `y`.
 */
export function lessThan(x: LikeNumber, y: LikeNumber): boolean {
	validLikeNumber(x);
	validLikeNumber(y);
	// x.re < y.re || (x.re == y.re && x.im < y.im)
	if (typeof x === 'number')
		if (typeof y === 'number') return x < y;
		else return x < y.real || (x == y.real && y.imaginary < 0);
	else if (typeof y === 'number') return x.real < y || (x.real == y && x.imaginary > 0);
	else
		return (
			x.real < y.real ||
			(x.real == y.real && x.imaginary < y.imaginary)
		);
}
/**
 * The function `lessThanOrEqual` checks if the first parameter is less than or equal to the second
 * parameter.
 * @param {LikeNumber} x - A value that can be compared to another value using the less than or equal
 * to operator. It can be of any type that implements the necessary comparison operations, such as
 * numbers, strings, or dates.
 * @param {LikeNumber} y - The parameter "y" is a value of type "LikeNumber".
 * @returns a boolean value.
 */
export function lessThanOrEqual(x: LikeNumber, y: LikeNumber): boolean {
	validLikeNumber(x);
	validLikeNumber(y);
	return lessThan(x, y) || equals(x, y);
}
/**
 * The function checks if the first input is greater than the second input.
 * @param {LikeNumber} x - A variable of type LikeNumber.
 * @param {LikeNumber} y - The parameter `y` is a value that can be compared to `x` to determine if `x`
 * is greater than `y`. Both `x` and `y` are of type `LikeNumber`, which means they can be any value
 * that can be converted to a number for comparison.
 * @returns a boolean value, which indicates whether the first parameter `x` is greater than the second
 * parameter `y`.
 */
export function greaterThan(x: LikeNumber, y: LikeNumber): boolean {
	validLikeNumber(x);
	validLikeNumber(y);
	return lessThan(y, x);
}
/**
 * The function checks if the first number is greater than or equal to the second number.
 * @param {LikeNumber} x - A variable of type LikeNumber, which means it can be any value that can be
 * converted to a number.
 * @param {LikeNumber} y - A value that is being compared to x.
 * @returns a boolean value.
 */
export function greaterThanOrEqual(x: LikeNumber, y: LikeNumber): boolean {
	validLikeNumber(x);
	validLikeNumber(y);
	return lessThan(y, x) || equals(x, y);
}

/**
 * The function `equals` checks if two values are equal, taking into account different types of
 * numbers.
 * @param {LikeNumber} x - The parameter `x` can be any value that is either a number or an instance of
 * the `ComplexNumber` class.
 * @param {LikeNumber} y - The parameter `y` is a variable of type `LikeNumber`.
 * @returns a boolean value indicating whether the two input values are equal.
 */
export function equals(x: LikeNumber, y: LikeNumber): boolean {
	if (typeof x === 'number' && typeof y === 'number') return x === y;
	if (typeof x === 'number' && y instanceof ComplexNumber)
		return x === y.real && y.imaginary === 0;
	if (x instanceof ComplexNumber && typeof y === 'number')
		return x.real === y && x.imaginary === 0;
	if (x instanceof ComplexNumber && y instanceof ComplexNumber)
		return x.real === y.real && x.imaginary === y.imaginary;
	return false;
}
/**
 * The function "negative" takes a number or a complex number and returns its negative value.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept either
 * a number or a `ComplexNumber` object.
 * @returns a negative value of the input number or complex number.
 */
export function negative(x: LikeNumber): ComplexNumber {
	if (typeof x === 'number') return ComplexNumber.from(-x);
	return ComplexNumber.from(-x.real, -x.imaginary);
}
/**
 * The `round` function rounds a complex number or a real number to a specified number of decimal
 * places.
 * @param {LikeNumber} x - The parameter `x` is a number or a complex number. It represents the value
 * that needs to be rounded.
 * @param {LikeNumber} [y=0] - The parameter `y` is an optional parameter of type `LikeNumber`. It
 * defaults to 0 if no value is provided.
 * @returns a ComplexNumber.
 */
export function round(x: LikeNumber, y: LikeNumber = 0): ComplexNumber {
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
/**
 * The `floor` function takes a number or a complex number and returns a new complex number with the
 * floor value of its real and imaginary parts.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept either
 * a `number` or a `ComplexNumber` object.
 * @returns a ComplexNumber object.
 */
export function floor(x: LikeNumber): ComplexNumber {
	validLikeNumber(x);
	if (typeof x === 'number') return ComplexNumber.from(Math.floor(x));
	// Floor the real and imaginary parts separately
	const real = Math.floor(x.real);
	const imaginary = Math.floor(x.imaginary);
	return ComplexNumber.from(real, imaginary);
}
/**
 * The function `isInt` checks if a given number or complex number is an integer.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can be either a
 * number or an object with `real` and `imaginary` properties.
 * @returns The function isInt returns a boolean value.
 */
export function isInt(x: LikeNumber): boolean {
	validLikeNumber(x);
	if (typeof x === 'number') return Number.isInteger(x);
	return Number.isInteger(x.real) && x.imaginary === 0;
}
/**
 * The function `getReal` takes a parameter `x` of type `LikeNumber` and returns the real number value
 * of `x` if it is a number, otherwise it returns the real number value of `x.real`.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can either be a
 * number or an object with a `real` property.
 * @returns a real number.
 */
export function getReal(x: LikeNumber): RealNumber {
	validLikeNumber(x);
	if (typeof x === 'number') return x;
	return x.real;
}
/**
 * The function `getImaginary` takes a parameter `x` of type `LikeNumber` and returns the imaginary
 * part of `x` if it is a complex number, otherwise it returns 0.
 * @param {LikeNumber} x - The parameter `x` is of type `LikeNumber`, which means it can accept either
 * a number or an object with an `imaginary` property.
 * @returns If the input `x` is a number, the function will return 0. Otherwise, it will return the
 * imaginary part of `x`.
 */
export function getImaginary(x: LikeNumber): RealNumber {
	validLikeNumber(x);
	if (typeof x === 'number') return 0;
	return x.imaginary;
}
//#endregion
