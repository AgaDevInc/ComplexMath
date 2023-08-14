const {
	add,
	divide,
	equals,
	multiply,
	power,
	square,
	subtract,
} = require('./functions.js');
const ComplexNumber = require('./ComplexNumber.class.js');
const { I, EULER, PI } = require('./constants.js');
const {
	skip,
	InvalidTokenError,
	exec,
	default: tokenize,
} = require('@agadev/utils');
const { multiNumberFunction } = require('./util.js');

class ParseComplexError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ParseComplexError';
	}
}

const TokenType = {
	Number: 'Number',
	Operator: 'Operator',
	OpenParen: 'OpenParen',
	CloseParen: 'CloseParen',
	OpenBracket: 'OpenBracket',
	CloseBracket: 'CloseBracket',
	OpenBrace: 'OpenBrace',
	CloseBrace: 'CloseBrace',
	Constant: 'Constant',
	Variable: 'Variable',
};

const TokenizeOptions = [
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
function isMultiplication(token) {
	if (token.type === TokenType.OpenBracket) return true; // 2[x] = 2*(x)
	if (token.type === TokenType.OpenParen) return true; // 2(x) = 2*(x)
	if (token.type === TokenType.OpenBrace) return true; // 2{x} = 2*(x)
	if (token.type === TokenType.Constant) return true; // xi = (x)*i
	if (token.type === TokenType.Variable) return true; // xy = (x)*y
	if (token.type === TokenType.Number) return true; // 2x = 2*(x)
	return false;
}

class Parser {
	constructor(source) {
		this.tokens = tokenize(source, TokenizeOptions);
	}
	at() {
		return this.tokens[0];
	}
	eat() {
		return this.tokens.shift();
	}
	next() {
		return this.tokens[1];
	}
	parseVariable() {
		const variable = this.eat();
		if (variable?.type === TokenType.Variable)
			return { type: 'variable', value: 1, name: variable.value };
		throw new ParseComplexError('Invalid variable');
	}
	parseConstant() {
		const constant = this.eat();
		if (
			constant?.value === 'i' ||
			constant?.value === 'e' ||
			constant?.value === 'π'
		)
			return { type: 'constant', name: constant.value };
		throw new ParseComplexError('Invalid constant');
	}
	parseValue() {
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
	powerValue() {
		const left = this.power();
		if (this.at() && isMultiplication(this.at())) {
			const right = this.multiplication();
			return { type: 'operator', value: '*', left, right };
		}
		return left;
	}
	power() {
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
	multiplication() {
		const left = this.power();
		if (
			this.at() &&
			this.at().type === TokenType.Operator &&
			(this.at().value === '*' || this.at().value === '/')
		) {
			const operator = this.eat();
			const right = this.power();
			return { type: 'operator', value: operator.value, left, right };
		}
		if (this.at() && isMultiplication(this.at())) {
			const right = this.multiplication();
			return { type: 'operator', value: '*', left, right };
		}
		return left;
	}
	addition() {
		const left = this.multiplication();
		if (
			this.at() &&
			this.at().type === TokenType.Operator &&
			(this.at().value === '+' || this.at().value === '-')
		) {
			const operator = this.eat();
			const right = this.multiplication();
			return { type: 'operator', value: operator.value, left, right };
		}
		return left;
	}
	parseExpression() {
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
	parse() {
		return this.parseExpression();
	}
	static evaluate(parse, scope) {
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
			if (scope[parse.name]) return ComplexNumber.from(scope[parse.name]);
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
	static simplify(parse, scope) {
		if (parse.type === 'variable' && scope[parse.name])
			return {
				type: 'number',
				value: multiply(parse.value, scope[parse.name]),
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
module.exports = Parser;
module.exports.default = Parser;
module.exports.ParseComplexError = ParseComplexError;

function eval_complex(value, scope) {
	const parse = new Parser(value).parse();
	return Parser.evaluate(parse, scope);
}
module.exports.eval_complex = eval_complex;
function divide_var(_left, _right, scope) {
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
module.exports.divide_var = divide_var;
function multiply_var(_left, _right, scope) {
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
module.exports.multiply_var = multiply_var;
function add_var(_left, _right, scope) {
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
module.exports.add_var = add_var;
function subtract_var(_left, _right, scope) {
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
module.exports.subtract_var = subtract_var;
function power_var(_left, _right, scope) {
	const left = Parser.simplify(_left, scope);
	const right = Parser.simplify(_right, scope);

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
module.exports.power_var = power_var;
function multiple_power_var(right, exponent) {
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
module.exports.multiple_power_var = multiple_power_var;
function getValue(parse) {
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
module.exports.getValue = getValue;
