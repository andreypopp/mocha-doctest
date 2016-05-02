/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

import fs from 'fs';
import {compile} from './compile';

const EXTENSION = '.' + (process.env.MOCHA_DOCTEST_EXT || 'md');

function loadTestdoc(module, filename) {
  let content = fs.readFileSync(filename, 'utf8');
  let source = compile(content, {filename: filename});
  return module._compile(source, filename);
}

require.extensions[EXTENSION] = loadTestdoc;
