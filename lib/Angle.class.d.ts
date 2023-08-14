import {Inspectable} from '@agadev/utils';
import type { RealNumber } from "./types.d.ts";
import { Color } from "@agadev/colors";

export default class Angle extends Inspectable {
  toConsoleColor: Color
	value: RealNumber;
	constructor(value: RealNumber)
}

export class Radians extends Angle {
	static from(ang: Degrees | Radians): Radians
	toString(): string 
}
export class Degrees extends Angle {
	static from(ang: Radians | Degrees): Degrees
	toString(): string 
}