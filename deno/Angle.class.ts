import Inspecteable from "https://deno.land/x/aga_util@1.0.0/Inspectable.class.ts";
import type { RealNumber } from "./types.d.ts";
import { PI } from "./constants.ts";
import { FOREGROUND } from "https://deno.land/x/colors_string@v1.0.1/mod.ts";


/* The code is defining an abstract class called `Angle` that extends the `Inspectable` class. The
`Angle` class has a protected property `toConsoleColor` which is set to `FOREGROUND.BLUE`. It also
has a constructor that takes a parameter `value` of type `RealNumber` with a default value of 0. The
constructor calls the `super()` method to invoke the constructor of the `Inspectable` class. */
export default abstract class Angle extends Inspecteable {
  protected toConsoleColor = FOREGROUND.BLUE
	constructor(public value: RealNumber = 0) {
		super();
	}
}

function formatRadians(value: RealNumber) {
	const PI_RAD = (value / PI);

	if (+PI_RAD === 1) return 'π';
	else if (+PI_RAD === -1) return '-π';
	else if (+PI_RAD === 0) return '';
	if (+PI_RAD < 1 && +PI_RAD > 0) return 'π/' + (1 / PI_RAD);
	else if (+PI_RAD > -1 && +PI_RAD < 0)
		return '-π/' + (1 / PI_RAD);
	
	const [int, dec] = value.toString().split('.');
	if(dec) {
		const fraction = formatRadians((+`0.${dec}` * PI));
		`${int}π + ${fraction.startsWith('-') ? `(${fraction})` : fraction}`
	}
	return `${value}π`;	
}

type ValidAngle = Radians | Degrees;

/* The Radians class is a subclass of Angle that provides methods for converting degrees to radians and
formatting radians as a string. */
export class Radians extends Angle {
/**
 * The function converts an angle from either radians or degrees to radians.
 * @param {ValidAngle} ang - The parameter `ang` is an object of type `ValidAngle`.
 * @returns The method is returning an instance of the `Radians` class.
 */
	static from(ang: ValidAngle) {
		if (ang instanceof Radians) return ang;
		if(ang instanceof Degrees) return new Radians(ang.value * (PI/180));
		throw new TypeError(`${ang} is not a valid angle`);
	}
	toString(): string {
		const v = formatRadians(this.value);
		return `${v}rad`;
	}
}
/* The `Degrees` class is a subclass of `Angle` that represents angles in degrees and provides methods
for converting between degrees and radians. */
export class Degrees extends Angle {
/**
 * The function converts an angle from either degrees or radians to degrees.
 * @param {ValidAngle} ang - The parameter `ang` is of type `ValidAngle`, which means it can be either
 * an instance of `Degrees` or `Radians`.
 * @returns The code is returning an angle in degrees.
 */
	static from(ang: ValidAngle) {
		if (ang instanceof Degrees) return ang;
		if(ang instanceof Radians) return new Degrees(ang.value * (180/PI));
		throw new TypeError(`${ang} is not a valid angle`);
	}
	toString(): string {
		return `${this.value}°`;
	}
}