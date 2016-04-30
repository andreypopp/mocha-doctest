# testdoc

Compiler from markdown to mocha test suites.

Write your tests like:

    Function `sum` calculates a sum of two numbers:

        import sum from 'mylibrary/sum'

        sum(2, 2)
        // => 4

The run them with mocha:

    % mocha --compilers md:testdoc/register
