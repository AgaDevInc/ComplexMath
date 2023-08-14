import ComplexNumber from './ComplexNumber.class.d.ts';
import { LikeNumber, RealNumber } from './types.d.ts';

export function isLikeNumber(value: unknown): value is LikeNumber

//#region Arithmetic functions
export function absolute(x: LikeNumber): RealNumber

/** x±y */
export function plusMinus(x: LikeNumber, y: LikeNumber): ComplexNumber[]

export function add(x: LikeNumber, y: LikeNumber): ComplexNumber
export function subtract(x: LikeNumber, y: LikeNumber): ComplexNumber
export function multiply(x: LikeNumber, y: LikeNumber): ComplexNumber
export function divide(x: LikeNumber, y: LikeNumber): ComplexNumber
export function modulo(x: LikeNumber, y: LikeNumber): ComplexNumber
export function exp(x: LikeNumber): ComplexNumber
export function log(x: LikeNumber): ComplexNumber
export function power(base: LikeNumber,	exponent: LikeNumber): ComplexNumber
export const square:{
	(x: LikeNumber, y: LikeNumber): ComplexNumber
	multidata(base: LikeNumber,	index: LikeNumber): ComplexNumber[]
}
//#endregion

//#region Trigonometric functions
export function sin(x: LikeNumber): ComplexNumber
export function cos(x: LikeNumber): ComplexNumber
export function tan(x: LikeNumber): ComplexNumber
export function cot(x: LikeNumber): ComplexNumber
export function sec(x: LikeNumber): ComplexNumber
export function csc(x: LikeNumber): ComplexNumber
//#endregion

//#region Program functions
export function equals(x: LikeNumber, y: LikeNumber): boolean
export function negative(x: LikeNumber): ComplexNumber
export function round(x: LikeNumber, y: LikeNumber): ComplexNumber
export function floor(x: LikeNumber): ComplexNumber
export function isInt(x: LikeNumber): boolean
//#endregion
