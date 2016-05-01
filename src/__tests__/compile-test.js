/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

import {compile} from '../compile';

let fence = '```';

describe('mocha-doctest', function() {

  it('compiles markdown to mocha test suites', function() {
    let markdown = `

Ok, this is a test case:

${fence}js+test
let sum = (x, y) => x + y;

sum(2, 2)
// => 4

sum(1, 2)
// => 3

sum(null, null)
// Error: ok

import some from "./some";
import testdocSome from "mocha-doctest/some";
import testdoc from "mocha-doctest";
${fence}
`.trim();
    let code = compile(markdown, {filename: __filename});
    console.log(code); // eslint-disable-line no-console
  });

});
