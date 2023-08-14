import type { Color } from '@agadev/colors';
import {Inspectable} from '@agadev/utils';
import type { LikeNumber } from "./types.d.ts";

export default class ComplexNumber extends Inspectable {
	protected toConsoleColor: Color
	public real: number;
	public imaginary: number;
	constructor(real?: number, imaginary?: number)
	toFraction(): string
	[Symbol.iterator](): Generator<number>
	valueOf(): number | string
	toJSON(): string
	toString(): string
	[Symbol.hasInstance](instance: unknown): boolean
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
	static isNaN(value: number): boolean
}