// ESM shim for set-cookie-parser
import * as parser from "set-cookie-parser";

export const parse = parser.parse;
export const splitCookiesString = parser.splitCookiesString;
export default parser;
