import { LikeNumber, scope } from './types.d.ts';

type equation = `${string}=${string}`;

/**
 * Resolves an equation
 *
 * This function is not finished so it may have errors
 */
export default function resolve(source: equation, scope?: scope): scope;
export default function resolve(
	source: string,
	scope?: scope
): LikeNumber | LikeNumber[];