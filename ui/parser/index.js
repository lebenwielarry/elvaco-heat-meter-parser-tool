import { parseUH50 } from './parser/src/parser.js';

// Exporting the function to be used by other modules
export default function (payload, meta) {
    return parseUH50(payload);
}
