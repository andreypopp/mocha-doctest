/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

import {inspect} from 'util';
import assert from 'assert';

export function assertRepr(expression, repr) {
  assert.equal(inspect(expression), repr);
}

export function assertError(expression, name, message) {
  try {
    expression();
  } catch(err) {
    assert.equal(err.name, name);
    assert.equal(err.message, message);
    return;
  }
  assert(false, 'Missing exception');
}
