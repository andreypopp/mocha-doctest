/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

import fs from 'fs';
import {compile} from './index';

require.extensions['.md'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  return module._compile(compile(content, {name: filename}), filename);
};
