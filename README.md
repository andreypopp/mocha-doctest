# mocha-doctest

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
