/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

import {spawnSync} from 'child_process'
import fs from 'fs'
import path from 'path'

const REGISTER = require.resolve('../register');
const CMD = require.resolve('mocha/bin/mocha');
const OPTIONS = `-R json --compilers testmd:${REGISTER}`.split(' ');

export function runTest(source) {
  source = '```js+test\n' + source + '\n```';

  let filename = path.join(__dirname, '..', '.testcase.testmd');
  try {
    fs.writeFileSync(filename, source);
    let info = spawnSync(CMD, OPTIONS.concat(filename), {
      env: {
        ...process.env,
        MOCHA_DOCTEST_EXT: 'testmd'
      }
    });
    let stdout = info.stdout.toString();
    return JSON.parse(stdout);
  } finally {
    fs.unlinkSync(filename);
  }
}
