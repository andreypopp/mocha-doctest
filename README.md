# mocha-doctest

[![Travis build status](https://img.shields.io/travis/andreypopp/mocha-doctest/master.svg)](https://travis-ci.org/andreypopp/validated)

Test your documentation.

Snippets like this:

    Ok, let's test addition:

    ```js+test
    2 + 2
    // => 4
    ```

are coverted into runnable Mocha test suites which can be tested with the
following command:

```
% mocha --compilers md:mocha-doctest ./README.md
```

## Installation & Usage

Install with:

```
% npm install mocha-doctest mocha
```

Run with:

```
% mocha --compilers md:mocha-doctest ./README.md
```

## Assertions against text representation

Trailing comments which starts with `=>` are treated as assertions against
textual representation of an expression which goes before:

```js+test
2 + 2
// => 4
```

## Regular assertions

Also `assert` Node.js module is available so you can use it directly:

```js+test
assert(2 + 2 === 4)
```

## Assertions for errors

If trailing comment is detected and start with `Error:` (actually any error name
which ends with `Error` suffix) line then it is treated as an assertion against
an error being thrown:

```js+test
let maybeFunction = undefined;

undefined()
// TypeError: undefined is not a function

null()
// TypeError: ...
```

## Testing async code (with Promise based API)

There's a possibility to test async code based on Promise API:

```js+test
function sleep(ms) {
  let promise = new Promise(resolve => setTimeout(resolve, ms));
  promise = promise.then(value => {
    value;
    // => undefined
    return value;
  });
  return promise;
}

await sleep(50).then(_ => 42);
// => 42
```

## Using wildcard pattern

You can use `...` specify a wildcards:

```js+test
let a = [1, 2, Math.random(), 4];

a
// => [ 1, 2, ..., 4 ]
```

## Babel

Project babel configuration will be used (either `.babelrc` or `"babel"` key in
`package.json`) but currently at least `es2015` preset must be used as
mocha-doctest emits ES2015 code. That might change is the future.

# Tests

Import required harness:

```js+test
import {runTest} from 'mocha-doctest/lib/testutils'
```

Simple assertions:

```js+test
let {passes, failures} = runTest(`
  1
  // => 1
`)

passes.length
// => 1

failures.length
// => 0
```

Assertions against an error:

```js+test
let {passes, failures} = runTest(`
  undefined()
  // TypeError: undefined is not a function
`)

passes.length
// => 1

failures.length
// => 0
```


Simple assertion with failure:

```js+test
let {passes, failures} = runTest(`
  2 + 2
  // => 5
`)

passes.length
// => 0

failures.length
// => 1

failures[0].err.expected
// => '5'
failures[0].err.actual
// => '4'
```

More complex assertions:

```js+test
let {passes, failures} = runTest(`
  [1, 2, 3]
  // => [ 1, 2, 3 ]
`)

passes.length
// => 1

failures.length
// => 0
```

Assertions which use `...` wildcard:

```js+test
let {passes, failures} = runTest(`
  [1, Math.random(), 3]
  // => [ 1, ..., 3 ]
`)

passes.length
// => 1

failures.length
// => 0
```

Assertions against an error with `...` wildcard:

```js+test
let {passes, failures} = runTest(`
  undefined()
  // TypeError: ...
`)

passes.length
// => 1

failures.length
// => 0
```

Assertions which use `...` wildcard (failure):

```js+test
let {passes, failures} = runTest(`
  let array = [1, Math.random(), 3]

  array
  // => [ 1, ..., 4 ]
`)

passes.length
// => 0

failures.length
// => 1

failures[0].err.expected
// => '[ 1, ..., 4 ]'
```

Assertions which async code:

```js+test
let {passes, failures} = runTest(`
  await 1
  // => 1

  await Promise.resolve(42)
  // => 42
`)

passes.length
// => 1

failures.length
// => 0
```

Assertions which async code (failures)

```js+test
let {passes, failures} = runTest(`
  await Promise.resolve(42)
  // => 43
`)

passes.length
// => 0

failures.length
// => 1

failures[0].err.expected
// => '43'
failures[0].err.actual
// => '42'
```

Assertions within async callbacks:

```js+test
let {passes, failures} = runTest(`
  await Promise.resolve(42).then(async value => {
    value;
    // => 42
    await Promise.resolve(43)
    // => 43
  })
`)

passes.length
// => 1

failures.length
// => 0
```

Assertions which async code errors:

```js+test
let {passes, failures} = runTest(`
  await Promise.reject(new Error('oops'))
  // Error: oops
`)

passes.length
// => 1

failures.length
// => 0
```

Assertions which async code errors (failures):

```js+test
let {passes, failures} = runTest(`
  await Promise.reject(new Error('oops'))
  // SomeError: nope
`)

passes.length
// => 0

failures.length
// => 1

failures[0].err.expected
// => 'SomeError: nope'
failures[0].err.actual
// => 'Error: oops'
```
