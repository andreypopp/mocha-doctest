/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

import {inspect} from 'util';
import assert from 'assert';

export function assertRepr(expression, expectation) {
  assert.equal(inspect(expression), expectation);
}
