/**
 * Testdoc runtime.
 *
 * Some of the code is based on doctest.js by Ian Bicking.
 *
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 * @copyright 2013, Ian Bicking and Contributors
 */

import {inspect} from 'util';
import assert from 'assert';

export function assertRepr(expression, repr) {
  let pattern = compilePattern(repr);
  let r = inspect(expression);
  if (!pattern.exec(r)) {
    assert.equal(r, repr);
  }
}

export function assertError(expression, name, message) {
  try {
    expression();
  } catch(err) {
    let repr = `${name}: ${message}`
    let pattern = compilePattern(repr);
    let r = `${err.name}: ${err.message}`;
    if (!pattern.exec(r)) {
      assert.equal(repr, r);
    }
    return;
  }
  assert(false, 'Missing exception');
}

/**
 * Compile expectation pattern to regexp.
 *
 * Based on code found in doctest.js by Ian Bicking.
 */
export function compilePattern(pattern) {
  let re = regexpEscape(pattern);
  re = '^' + re + '$';
  re = re.replace(/\\\.\\\.\\\./g, '[\\S\\s\\r\\n]*');
  re = re.replace(/\\\?/g, '[a-zA-Z0-9_.\\?]+');
  re = re.replace(/[ \t]+/g, ' +');
  re = re.replace(/["']/g, '[\'"]');
  return new RegExp(re);
}

const REGEXP_SPECIALS = [
  '/', '.', '*', '+', '?', '|', '$',
  '(', ')', '[', ']', '{', '}', '\\'
];
const REGEXP_SPECIALS_RE = new RegExp('(\\' + REGEXP_SPECIALS.join('|\\') + ')', 'g');

/**
 * Escape text for use as a regexp.
 *
 * Based on code found in doctest.js by Ian Bicking.
 */
function regexpEscape(text) {
  return text.replace(REGEXP_SPECIALS_RE, '\\$1');
}
