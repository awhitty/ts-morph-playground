import { conf as conf$1, language as language$1 } from './typescript-9be7635c.js';
import './editor.main-1bbb8e5c.js';
import './_polyfill-node_global-a48e63f2.js';
import './_commonjsHelpers-8c19dec8.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var conf = conf$1;
var language = {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',
    tokenPostfix: '.js',
    keywords: [
        'break',
        'case',
        'catch',
        'class',
        'continue',
        'const',
        'constructor',
        'debugger',
        'default',
        'delete',
        'do',
        'else',
        'export',
        'extends',
        'false',
        'finally',
        'for',
        'from',
        'function',
        'get',
        'if',
        'import',
        'in',
        'instanceof',
        'let',
        'new',
        'null',
        'return',
        'set',
        'super',
        'switch',
        'symbol',
        'this',
        'throw',
        'true',
        'try',
        'typeof',
        'undefined',
        'var',
        'void',
        'while',
        'with',
        'yield',
        'async',
        'await',
        'of'
    ],
    typeKeywords: [],
    operators: language$1.operators,
    symbols: language$1.symbols,
    escapes: language$1.escapes,
    digits: language$1.digits,
    octaldigits: language$1.octaldigits,
    binarydigits: language$1.binarydigits,
    hexdigits: language$1.hexdigits,
    regexpctl: language$1.regexpctl,
    regexpesc: language$1.regexpesc,
    tokenizer: language$1.tokenizer
};

export { conf, language };
//# sourceMappingURL=javascript-53b6cfb4.js.map
