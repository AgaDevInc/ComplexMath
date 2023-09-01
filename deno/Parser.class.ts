import {
	add,
	divide,
	equals,
	multiply,
	power,
	square,
	subtract,
} from './functions.ts';
import ComplexNumber from './ComplexNumber.class.ts';
import tokenize, {
	Token as Token_Type,
	TokenOptions,
	skip,
	InvalidTokenError
} from "https://deno.land/x/aga_util@1.0.0/tokenize.fn.ts";
import { scope, valid_var, LikeNumber } from './types.d.ts';
import { exec } from 'https://deno.land/x/aga_util@1.0.0/util.ts';
import { EULER, I, PI } from './constants.ts';
import { multiNumberFunction } from './util.ts';

/* The `ParseComplexError` class is a custom error class that extends the built-in `Error` class in
TypeScript. */
export class ParseComplexError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ParseComplexError';
	}
}
/* The above code is defining an enum called `TokenType` in TypeScript. This enum represents different
types of tokens that can be used in a programming language or expression. The enum values include
`Number`, `Operator`, `OpenParen`, `CloseParen`, `OpenBracket`, `CloseBracket`, `OpenBrace`,
`CloseBrace`, `Constant`, and `Variable`. Each enum value is assigned a string value that represents
its type. */
export const enum TokenType {
	Number = 'Number',
	Operator = 'Operator',
	OpenParen = 'OpenParen',
	CloseParen = 'CloseParen',
	OpenBracket = 'OpenBracket',
	CloseBracket = 'CloseBracket',
	OpenBrace = 'OpenBrace',
	CloseBrace = 'CloseBrace',
	Constant = 'Constant',
	Variable = 'Variable',
}

const TokenizeOptions: TokenOptions<TokenType> = [
	['(', TokenType.OpenParen],
	[')', TokenType.CloseParen],
	['[', TokenType.OpenBracket],
	[']', TokenType.CloseBracket],
	['{', TokenType.OpenBrace],
	['}', TokenType.CloseBrace],
	[/\+|\-|\*|\/|\^/, TokenType.Operator],
	[/i|e|π/, TokenType.Constant],
	[
		/[0-9]/,
		function (_, { col, row }, line) {
			let number = '';
			let nchar = _;
			let i = col;
			while (nchar.match(/[0-9]/) || nchar === '.') {
				if (nchar === '.' && number.includes('.'))
					throw new InvalidTokenError('Invalid number double decimal');
				number += nchar;
				nchar = line[++i] || '';
			}
			return [{ type: TokenType.Number, value: number, col, row }, i - col - 1];
		},
	],
	[/\s/, skip],
	[/[a-z]/i, TokenType.Variable],
];

/* The above code is defining an interface named `ParseComplexResultVariable` in TypeScript. This
interface has four properties: */
export interface ParseComplexResultVariable {
	type: 'variable';
	value: LikeNumber;
	name: valid_var;
}
/* The above code is defining an interface named `ParseComplexResultConstant` in TypeScript. This
interface has three properties: `type`, `name`, and `value`. The `type` property is of type
`'constant'`, indicating that the parsed result is a constant. The `name` property is of type `'i' |
'e' | 'π'`, indicating that the constant can be one of the three values: `'i'`, `'e'`, or `'π'`. */
export interface ParseComplexResultConstant {
	type: 'constant';
	name: 'i' | 'e' | 'π';
}
/* The above code is defining an interface named `ParseComplexResultNumber` in TypeScript. This
interface has two properties: `type` and `value`. The `type` property is of type `'number'`,
indicating that the value being parsed is a number. The `value` property is of type `LikeNumber`,
which is not defined in the given code snippet. */
export interface ParseComplexResultNumber {
	type: 'number';
	value: LikeNumber;
}
/* The above code is defining an interface named `ParseComplexResultOperator` in TypeScript. This
interface has four properties: `type`, `value`, `left`, and `right`. The `type` property is of type
string and is used to identify the type of the object as 'operator'. The `value` property is of type
string and represents the value of the operator. The `left` and `right` properties are of type
`ParseComplexResult` and represent the left and right operands of the operator, respectively. */
export interface ParseComplexResultOperator {
	type: 'operator';
	value: string;
	left: ParseComplexResult;
	right: ParseComplexResult;
}
/* The above code is defining an interface named `ParseComplexResultList` in TypeScript. This interface
has two properties: `type` and `value`. The `type` property is of type string and is set to the
value `'list'`. The `value` property is an array of `LikeNumber` objects. */
export interface ParseComplexResultList {
	type: 'list';
	value: LikeNumber[];
}

export type ParseComplexResultValue =
	| ParseComplexResultNumber
	| ParseComplexResultVariable
	| ParseComplexResultConstant;
export type ParseComplexResult =
	| ParseComplexResultValue
	| ParseComplexResultOperator
	| ParseComplexResultList;

type Token = Token_Type<TokenType>;
function isMultiplication(token: Token) {
	if (token.type === TokenType.OpenBracket) return true; // 2[x] = 2*(x)
	if (token.type === TokenType.OpenParen) return true; // 2(x) = 2*(x)
	if (token.type === TokenType.OpenBrace) return true; // 2{x} = 2*(x)
	if (token.type === TokenType.Constant) return true; // xi = (x)*i
	if (token.type === TokenType.Variable) return true; // xy = (x)*y
	if (token.type === TokenType.Number) return true; // 2x = 2*(x)
	return false;
}

/* The Parser class is a TypeScript class that tokenizes and parses mathematical expressions, and
provides methods for evaluating and simplifying the parsed expressions. */
export default class Parser {
	tokens: Token[];
	constructor(source: string) {
		this.tokens = tokenize(source, TokenizeOptions);
	}
	protected at() {
		return this.tokens[0];
	}
	protected eat() {
		return this.tokens.shift();
	}
	protected next() {
		return this.tokens[1];
	}
	protected parseVariable(): ParseComplexResultVariable {
		const variable = this.eat();
		if (variable?.type === TokenType.Variable)
			return { type: 'variable', value: 1, name: variable.value as valid_var };
		throw new ParseComplexError('Invalid variable');
	}
	protected parseConstant(): ParseComplexResultConstant {
		const constant = this.eat();
		if (
			constant?.value === 'i' ||
			constant?.value === 'e' ||
			constant?.value === 'π'
		)
			return { type: 'constant', name: constant.value };
		throw new ParseComplexError('Invalid constant');
	}
	protected parseValue(): ParseComplexResult {
		if (this.at().type === TokenType.OpenParen) {
			this.eat();
			const left = this.parseExpression();
			if (this.at() && this.at().type === TokenType.CloseParen) {
				this.eat();
				return left;
			}
		}
		if (this.at().type === TokenType.OpenBracket) {
			this.eat();
			const left = this.parseExpression();
			if (this.at() && this.at().type === TokenType.CloseBracket) {
				this.eat();
				return left;
			}
		}
		if (this.at().type === TokenType.OpenBrace) {
			this.eat();
			const left = this.parseExpression();
			if (this.at() && this.at().type === TokenType.CloseBrace) {
				this.eat();
				return left;
			}
		}
		if (this.at().type === TokenType.Constant) {
			return this.parseConstant();
		}
		if (this.at().type === TokenType.Variable) {
			return this.parseVariable();
		}
		if (this.at().type === TokenType.Number) {
			const number = this.eat();
			return {
				type: 'number',
				value: new ComplexNumber(parseFloat(number?.value || '0')),
			};
		}
		if (this.at().type === TokenType.Operator && this.at().value === '-') {
			this.eat();
			const right = this.parseValue();
			return {
				type: 'operator',
				value: '-',
				left: { type: 'number', value: ComplexNumber.from(0) },
				right,
			};
		}
		throw new ParseComplexError('Invalid value');
	}
	protected powerValue(): ParseComplexResult {
		const left = this.power();
		if (this.at() && isMultiplication(this.at())) {
			const right = this.multiplication();
			return { type: 'operator', value: '*', left, right };
		}
		return left;
	}
	protected power(): ParseComplexResult {
		const left = this.parseValue();
		if (
			this.at() &&
			this.at().type === TokenType.Operator &&
			this.at().value === '^'
		) {
			this.eat();
			const right = this.powerValue();
			return { type: 'operator', value: '^', left, right };
		}
		return left;
	}
	protected multiplication(): ParseComplexResult {
		const left = this.power();
		if (
			this.at() &&
			this.at().type === TokenType.Operator &&
			(this.at().value === '*' || this.at().value === '/')
		) {
			const operator = this.eat() as Token;
			const right = this.power();
			return { type: 'operator', value: operator.value, left, right };
		}
		if (this.at() && isMultiplication(this.at())) {
			const right = this.multiplication();
			return { type: 'operator', value: '*', left, right };
		}
		return left;
	}
	protected addition(): ParseComplexResult {
		const left = this.multiplication();
		if (
			this.at() &&
			this.at().type === TokenType.Operator &&
			(this.at().value === '+' || this.at().value === '-')
		) {
			const operator = this.eat() as Token;
			const right = this.multiplication();
			return { type: 'operator', value: operator.value, left, right };
		}
		return left;
	}
	protected parseExpression(): ParseComplexResult {
		const left = this.addition();
		if (
			this.at() &&
			(this.at().type === TokenType.Variable ||
				this.at().type === TokenType.Constant ||
				this.at().type === TokenType.Number ||
				this.at().type === TokenType.OpenParen ||
				this.at().type === TokenType.OpenBracket ||
				this.at().type === TokenType.OpenBrace)
		) {
			return {
				type: 'operator',
				value: '*',
				left,
				right: this.parseExpression(),
			};
		}
		return left;
	}
/**
 * The function "parse" in TypeScript parses an expression.
 * @returns The `parse()` method is returning the result of the `parseExpression()` method.
 */
	public parse() {
		return this.parseExpression();
	}
/**
 * The `evaluate` function takes a parsed expression, evaluates it, and returns the result as a complex
 * number or an array of complex numbers.
 * @param {ParseComplexResult} parse - The `parse` parameter is an object that represents a parsed
 * expression. It has the following properties:
 * @param {scope} scope - The `scope` parameter is an object that contains variables and their
 * corresponding values. It is used to look up the values of variables when evaluating expressions.
 * @returns The function `evaluate` returns a `LikeNumber` or an array of `LikeNumber`.
 */
	static evaluate(
		parse: ParseComplexResult,
		scope: scope
	): LikeNumber | LikeNumber[] {
		if (parse.type === 'number') return ComplexNumber.from(parse.value);
		if (parse.type === 'operator') {
			const left = Parser.evaluate(parse.left, scope);
			const right = Parser.evaluate(parse.right, scope);
			switch (parse.value) {
				case '+':
					return exec(left, right, add);
				case '-':
					return exec(left, right, subtract);
				case '*':
					return exec(left, right, multiply);
				case '/':
					return exec(left, right, divide);
				case '^':
					return exec(left, right, power);
			}
		}
		if (parse.type === 'variable') {
			if (scope[parse.name])
				return ComplexNumber.from(scope[parse.name] as LikeNumber);
			throw new ParseComplexError(`Variable ${parse.name} not found`);
		}
		if (parse.type === 'constant') {
			if (parse.name === 'i') return I;
			if (parse.name === 'e') return EULER;
			if (parse.name === 'π') return PI;
			throw new ParseComplexError(`Constant ${parse.name} not found`);
		}
		if (parse.type === 'list') {
			const results = [];
			for (const value of parse.value) results.push(value);
			return results;
		}
		throw new ParseComplexError('Invalid parse');
	}
/**
 * The function simplifies a parsed mathematical expression by evaluating variables and performing
 * arithmetic operations.
 * @param {ParseComplexResult} parse - The `parse` parameter is an object that represents a parsed
 * mathematical expression. It has the following properties:
 * @param {scope} scope - The `scope` parameter is an object that represents the current scope or
 * context in which the parsing and simplification is being performed. It contains variable names as
 * keys and their corresponding values as values. The `scope` object is used to look up the values of
 * variables during the simplification process.
 * @returns The function `simplify` returns a `ParseComplexResult` object.
 */
	static simplify(parse: ParseComplexResult, scope: scope): ParseComplexResult {
		if (parse.type === 'variable' && scope[parse.name])
			return {
				type: 'number',
				value: multiply(parse.value, scope[parse.name] as LikeNumber),
			};

		if (parse.type !== 'operator') return parse;
		const operator = parse.value;
		const left = Parser.simplify(parse.left, scope);
		const right = Parser.simplify(parse.right, scope);

		if (operator === '/') return divide_var(left, right, scope);
		if (operator === '*') return multiply_var(left, right, scope);
		if (operator === '+') return add_var(left, right, scope);
		if (operator === '-') return subtract_var(left, right, scope);
		if (operator === '^') return power_var(left, right, scope);

		return { type: 'operator', value: operator, left, right };
	}
}
/**
 * The `eval_complex` function in TypeScript evaluates a complex expression using a given scope.
 * @param {string} value - The `value` parameter is a string that represents a complex mathematical
 * expression or equation that you want to evaluate. It can include numbers, operators, variables, and
 * functions.
 * @param {scope} scope - The `scope` parameter is an object that contains variables and their
 * corresponding values. It is used to provide a context for evaluating the expression in the `value`
 * parameter.
 * @returns The function `eval_complex` returns the result of evaluating the parsed expression `parse`
 * using the provided `scope`.
 */
export function eval_complex(value: string, scope: scope) {
	const parse = new Parser(value).parse();
	return Parser.evaluate(parse, scope);
}

/**
 * The `divide_var` function divides two variables or numbers and returns the result.
 * @param {ParseComplexResult} _left - The `_left` parameter is of type `ParseComplexResult` and
 * represents the left operand of the division operation. It contains information about the type and
 * value of the left operand.
 * @param {ParseComplexResult} _right - The `_right` parameter is the right-hand side of the division
 * operation. It is of type `ParseComplexResult`, which is a data structure representing the result of
 * parsing and simplifying a complex expression.
 * @param {scope} scope - The `scope` parameter is an object that contains the values of variables in
 * the current scope. It is used to simplify the expressions before performing the division operation.
 * @returns a `ParseComplexResult` object.
 */
export function divide_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);
	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: divide(left.value, right.value) };
	if (left.type === 'variable' && right.type === 'variable') {
		if (left.name === right.name)
			return {
				type: 'number',
				value: ComplexNumber.from(divide(left.value, right.value)),
			};
		const value = divide(left.value, right.value);
		return {
			type: 'operator',
			value: '*',
			left: { type: 'number', value },
			right: {
				type: 'operator',
				value: '/',
				left: { type: 'variable', value: 1, name: left.name },
				right: { type: 'variable', value: 1, name: right.name },
			},
		};
	}
	if (left.type === 'variable') {
		if (right.type === 'number') {
			return {
				type: 'variable',
				value: divide(left.value, right.value),
				name: left.name,
			};
		}
	}
	if (left.type === 'operator' && right.type !== 'operator') {
		if (left.value === '+') {
			return add_var(
				divide_var(left.left, right, scope),
				divide_var(left.right, right, scope),
				scope
			);
		}
		if (left.value === '-') {
			return subtract_var(
				divide_var(left.left, right, scope),
				divide_var(left.right, right, scope),
				scope
			);
		}
	}
	return {
		type: 'operator',
		value: '/',
		left,
		right,
	};
}
/**
 * The `multiply_var` function multiplies two variables or numbers together, simplifying the result if
 * possible.
 * @param {ParseComplexResult} _left - The `_left` parameter is of type `ParseComplexResult` and
 * represents the left operand of the multiplication operation. It contains information about the type
 * and value of the operand.
 * @param {ParseComplexResult} _right - The `_right` parameter is of type `ParseComplexResult` and
 * represents the right operand of the multiplication operation. It is used to perform the
 * multiplication operation with the left operand `_left`.
 * @param {scope} scope - The `scope` parameter is an object that contains the variables and their
 * values in the current context. It is used to simplify and evaluate expressions involving variables.
 * @returns a `ParseComplexResult` object.
 */
export function multiply_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);
	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: multiply(left.value, right.value) };
	if (left.type === 'number' && equals(left.value, 1)) return right;
	if (right.type === 'number' && equals(right.value, 1)) return left;
	if (left.type === 'number' && equals(left.value, 0))
		return { type: 'number', value: 0 };
	if (right.type === 'number' && equals(right.value, 0))
		return { type: 'number', value: 0 };
	if (left.type === 'variable' && right.type === 'variable') {
		if (left.name === right.name) {
			return multiply_var(
				{ type: 'number', value: multiply(left.value, right.value) },
				{
					type: 'operator',
					value: '^',
					left: { type: 'variable', value: 1, name: left.name },
					right: { type: 'number', value: 2 },
				},
				scope
			);
		}
		return multiply_var(
			{ type: 'number', value: multiply(left.value, right.value) },
			{
				type: 'operator',
				value: '*',
				left: { type: 'variable', value: 1, name: left.name },
				right: { type: 'variable', value: 1, name: right.name },
			},
			scope
		);
	}
	if (left.type === 'variable') {
		if (right.type === 'number')
			return {
				type: 'variable',
				value: multiply(left.value, right.value),
				name: left.name,
			};
	}
	if (right.type === 'variable') {
		if (left.type === 'number') {
			return {
				type: 'variable',
				value: multiply(left.value, right.value),
				name: right.name,
			};
		}
	}
	if (left.type === 'operator' && right.type !== 'operator') {
		if (left.value === '+')
			return add_var(
				multiply_var(left.left, right, scope),
				multiply_var(left.right, right, scope),
				scope
			);
		if (left.value === '-')
			return subtract_var(
				multiply_var(left.left, right, scope),
				multiply_var(left.right, right, scope),
				scope
			);
		if (left.value === '/')
			return divide_var(
				multiply_var(left.left, right, scope),
				multiply_var(left.right, right, scope),
				scope
			);
		if (left.value === '*')
			return multiply_var(
				multiply_var(left.left, right, scope),
				multiply_var(left.right, right, scope),
				scope
			);
	}
	if (left.type !== 'operator' && right.type === 'operator') {
		if (right.value === '+')
			return add_var(
				multiply_var(left, right.left, scope),
				multiply_var(left, right.right, scope),
				scope
			);
		if (right.value === '-')
			return subtract_var(
				multiply_var(left, right.left, scope),
				multiply_var(left, right.right, scope),
				scope
			);
		if (right.value === '/')
			return divide_var(
				multiply_var(left, right.left, scope),
				multiply_var(left, right.right, scope),
				scope
			);
		if (right.value === '*')
			return multiply_var(
				multiply_var(left, right.left, scope),
				multiply_var(left, right.right, scope),
				scope
			);
	}
	return {
		type: 'operator',
		value: '*',
		left,
		right,
	};
}
/**
 * The `add_var` function takes two parsed complex expressions and a scope, and returns the result of
 * adding them together.
 * @param {ParseComplexResult} _left - The `_left` parameter is a `ParseComplexResult` object
 * representing the left operand of the addition operation. It contains information about the type and
 * value of the operand.
 * @param {ParseComplexResult} _right - The `_right` parameter is a `ParseComplexResult` object that
 * represents the right operand of the addition operation. It contains information about the type and
 * value of the operand, as well as any nested expressions.
 * @param {scope} scope - The `scope` parameter is an object that represents the current scope or
 * environment in which the variables and functions are defined. It is used to look up the values of
 * variables and perform operations on them.
 * @returns The function `add_var` returns a `ParseComplexResult` object.
 */
export function add_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);
	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: add(left.value, right.value) };
	if (left.type === 'variable' || right.type === 'variable')
		return { type: 'operator', value: '+', left, right };
	if (left.type === 'operator' && right.type !== 'operator') {
		if (left.value === '+') {
			return add_var(left.left, add_var(left.right, right, scope), scope);
		}
		if (left.value === '-') {
			return subtract_var(left.left, add_var(left.right, right, scope), scope);
		}
	}
	if (left.type !== 'operator' && right.type === 'operator') {
		if (right.value === '+') {
			return add_var(add_var(left, right.left, scope), right.right, scope);
		}
		if (right.value === '-') {
			return subtract_var(add_var(left, right.left, scope), right.right, scope);
		}
	}
	return { type: 'operator', value: '+', left, right };
}
/**
 * The function subtracts two variables or numbers and returns the result.
 * @param {ParseComplexResult} _left - The `_left` parameter is of type `ParseComplexResult` and
 * represents the left operand of the subtraction operation. It contains information about the type and
 * value of the left operand.
 * @param {ParseComplexResult} _right - The `_right` parameter is the right operand of the subtraction
 * operation. It is of type `ParseComplexResult`, which represents the result of parsing and
 * simplifying a complex expression.
 * @param {scope} scope - The `scope` parameter is an object that contains the variables and their
 * values in the current scope. It is used to resolve any variable references in the expression being
 * evaluated.
 * @returns a `ParseComplexResult` object.
 */
export function subtract_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);
	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: subtract(left.value, right.value) };
	if (left.type === 'variable' || right.type === 'variable')
		return { type: 'operator', value: '*', left, right };
	if (left.type === 'operator' && right.type !== 'operator') {
		if (left.value === '+') {
			return add_var(left.left, subtract_var(left.right, right, scope), scope);
		}
		if (left.value === '-') {
			return subtract_var(
				left.left,
				subtract_var(left.right, right, scope),
				scope
			);
		}
	}
	if (left.type !== 'operator' && right.type === 'operator') {
		if (right.value === '+') {
			return add_var(subtract_var(left, right.left, scope), right.right, scope);
		}
		if (right.value === '-') {
			return subtract_var(
				subtract_var(left, right.left, scope),
				right.right,
				scope
			);
		}
	}
	return { type: 'operator', value: '-', left, right };
}
/**
 * The `power_var` function calculates the power of two numbers or expressions.
 * @param {ParseComplexResult} _left - The `_left` parameter is of type `ParseComplexResult` and
 * represents the left operand of the power operation. It can be a number, a variable, or an operator
 * expression.
 * @param {ParseComplexResult} _right - The `_right` parameter is the exponent value in the power
 * operation. It represents the number or expression that will be raised to the power of another number
 * or expression.
 * @param {scope} scope - The `scope` parameter is an object that represents the current scope or
 * environment in which the code is being executed. It typically contains variables and their
 * corresponding values that are accessible within the code.
 * @returns a `ParseComplexResult` object.
 */
export function power_var(
	_left: ParseComplexResult,
	_right: ParseComplexResult,
	scope: scope
): ParseComplexResult {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope) as
		| ParseComplexResultNumber
		| ParseComplexResultList;

	if (right.type === 'number' && equals(right.value, 0))
		return { type: 'number', value: 1 };
	if (right.type === 'number' && equals(right.value, 1)) return left;

	if (left.type === 'number' && right.type === 'number')
		return { type: 'number', value: power(left.value, right.value) };

	if (left.type === 'operator') {
		if (left.value === '*') {
			return multiply_var(
				power_var(left.left, right, scope),
				power_var(left.right, right, scope),
				scope
			);
		}
		if (left.value === '/') {
			return divide_var(
				power_var(left.left, right, scope),
				power_var(left.right, right, scope),
				scope
			);
		}
		if (left.value === '^') {
			return power_var(
				left.left,
				multiply_var(left.right, right, scope),
				scope
			);
		}
	}
	return { type: 'operator', value: '^', left, right };
}
/**
 * The function calculates the result of raising a number or a list of numbers to a given exponent.
 * @param {| ParseComplexResultNumber
 * 		| ParseComplexResultConstant
 * 		| ParseComplexResultList} right - The `right` parameter can have one of three types:
 * @param {LikeNumber} exponent - The `exponent` parameter represents the power to which the `right`
 * variable will be raised. It can be any numeric value.
 * @returns The function `multiple_power_var` returns either a `ParseComplexResultNumber` or a
 * `ParseComplexResultList` depending on the input parameters and the logic inside the function.
 */
export function multiple_power_var(
	right:
		| ParseComplexResultNumber
		| ParseComplexResultConstant
		| ParseComplexResultList,
	exponent: LikeNumber
): ParseComplexResultNumber | ParseComplexResultList {
	if (right.type === 'list') {
		const actualRoots = [];
		for (const value of right.value) {
			const data = multiple_power_var({ type: 'number', value }, exponent);
			if (data.type === 'list') actualRoots.push(...data.value);
			else actualRoots.push(data.value);
		}
		if (actualRoots.length === 1)
			return { type: 'number', value: actualRoots[0] };
		return { type: 'list', value: actualRoots };
	}

	const index = divide(1, exponent);

	const base = getValue(right);
	const response = multiNumberFunction(square.multidata)(base, index);
	if (response[1] === undefined) return { type: 'number', value: response[0] };

	return { type: 'list', value: response };
}

/**
 * The function `getValue` takes a `ParseComplexResult` object and returns the corresponding value(s)
 * based on the type of the parse.
 * @param {ParseComplexResult} parse - The `parse` parameter is an object that represents a parsed
 * mathematical expression. It has the following properties:
 * @returns a value of type `LikeNumber` or `LikeNumber[]`.
 */
export function getValue(parse: ParseComplexResult): LikeNumber | LikeNumber[] {
	if (parse.type === 'number') return parse.value;
	if (parse.type === 'constant') {
		if (parse.name === 'i') return I;
		if (parse.name === 'e') return EULER;
		if (parse.name === 'π') return PI;
	}
	if (parse.type === 'list') return parse.value;
	if (parse.type === 'variable') return parse.value;
	if (parse.type === 'operator') return Parser.evaluate(parse, {});

	throw new ParseComplexError('Invalid parse');
}
