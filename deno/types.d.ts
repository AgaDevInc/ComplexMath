import ComplexNumber from "./ComplexNumber.class.ts";

export type RealNumber = number;
export type LikeNumber = RealNumber | ComplexNumber;

export type valid_var = 'a'|'b'|'c'|'d'|'f'|'g'|'h'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z';
export type scope = {
  [key in valid_var]?: LikeNumber | LikeNumber[]
};