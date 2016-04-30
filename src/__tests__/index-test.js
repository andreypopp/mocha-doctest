/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

// import assert from 'assert';
import {compile} from '../index';

describe('testdoc', function() {

  it('compiles markdown to mocha test suites', function() {
    let markdown = `

Ok, this is a test case:

    let sum = (x, y) => x + y;

    sum(2, 2)
    // => 4

    sum(1, 2)
    // => 3

    sum(null, null)
    // Error: ok

    `.trim();
    let code = compile(markdown, {filename: __filename});
    console.log(code);
  });

});
