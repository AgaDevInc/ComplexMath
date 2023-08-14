import {Inspectable} from '@agadev/utils';
import Angle from './Angle.class.d.ts';
import ComplexNumber from './ComplexNumber.class.d.ts';
import { LikeNumber, RealNumber } from './types.d.ts';

export enum AngleType {
	degrees = 'degrees',
	radians = 'radians',
}

export default class Polar extends Inspectable {
	public magnitude: RealNumber;
	public angle: Angle;
	constructor(magnitude: RealNumber, angle: Angle);
	toComplexNumber(): ComplexNumber
	static from(value: LikeNumber): Polar
	toString(): string
	static toComplexNumber(magnitude: RealNumber, angle: Angle): ComplexNumber;
	static toComplexNumber(
		magnitude: RealNumber,
		angle: RealNumber,
		type?: AngleType
	): ComplexNumber;
}

export function comparePolar(a: Polar, b: Polar): boolean
