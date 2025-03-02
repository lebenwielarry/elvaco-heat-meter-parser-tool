import { parseUH50 } from './parser/src/parser.js';

export default function (payload, meta) {
    return parseUH50(payload);
}
