# testdoc

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
% mocha --compilers md:testdoc/register ./README.md
```

## Installation & Usage

Install with:

```
% npm install testdoc mocha
```

Run with:

```
% mocha --compilers md:testdoc/register ./README.md
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
```
