import Inspecteable from 'https://agacdn.onrender.com/AgaDev:utils@1.1.0/Inspectable.class.ts';
import type { RealNumber } from "./types.d.ts";
import { PI } from "./constants.ts";
import { FOREGROUND } from "https://agacdn.onrender.com/AgaDev:colors@1.0.0/";

export default class Angle extends Inspecteable {
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

export class Radians extends Angle {
	static from(ang: Degrees | Radians) {
		if (ang instanceof Radians) return ang;
		const radians =((ang.value* PI)/ (180));
		return new Radians(radians);
	}
	toString(): string {
		const v = formatRadians(this.value);
		return `${v}rad`;
	}
}
export class Degrees extends Angle {
	static from(ang: Radians | Degrees) {
		if (ang instanceof Degrees) return ang;
		const degrees = ((ang.value* (180))* PI);
		return new Degrees(degrees);
	}
	toString(): string {
		return `${this.value}°`;
	}
}