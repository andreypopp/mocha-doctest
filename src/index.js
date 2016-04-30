/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 */

import generate from 'babel-generator';
import * as BabelCore from 'babel-core';
import * as types from 'babel-types';
import * as Remark from 'remark';
import traverse from 'babel-traverse';
import * as Babylon from 'babylon';
import visitNode from 'unist-util-visit';

const TESTDOC_SEEN = '__TESTDOC_SEEN';
const RUNTIME = require.resolve('./runtime');

export function compile(source, options = {}) {
  let node = Remark.parse(source);
  let testCases = [];

  visitNode(node, 'code', (node, index, parent) => {
    let prev = parent.children[index - 1];
    let title = null;
    if (prev && prev.type === 'paragraph') {
      title = renderText(prev);
    }
    if (title && title[title.length - 1] === ':') {
      title = title.slice(0, title.length - 1);
    }
    testCases.push({
      title: title,
      lang: node.lang,
      value: node.value
    });
  });

  let importList = [];
  let body = [];

  testCases.forEach(testCase => {
    let node = Babylon.parse(testCase.value, {allowImportExportEverywhere: true});
    traverse(node, {

      enter(path) {
        if (!path.node[TESTDOC_SEEN] && isAssertionNode(path.node)) {
          let assertion = stmt`
          `;
          let nodes = stmt`
            it("${types.stringLiteral(testCase.title || 'works')}", function() {
              __testdocRuntime.assertRepr(
                ${path.node.expression},
                "${parseExpectationFromNode(path.node)}"
              );
            });
          `;
          nodes[TESTDOC_SEEN] = true;
          path.replaceWithMultiple(nodes);
        } else if (types.isImportDeclaration(path.node)) {
          importList.push(path.node);
          path.remove();
        }
      }

    });

    body = body.concat(node.program.body);
  });

  let suite = types.functionExpression(null, [], types.blockStatement(body));

  let program = [];
  program = program.concat(
    stmt`
      import * as __testdocRuntime from '${types.stringLiteral(RUNTIME)}';
      import assert from 'assert';
    `,
    importList,
    stmt`
      describe("${types.stringLiteral(options.name || 'Suite')}", ${suite});
    `
  );
  program = types.program(program);
  program = BabelCore.transformFromAst(program, undefined, {presets: ['es2015']}).ast;

  console.log(generate(program).code);
  return generate(program).code;
}

const ASSERTION_RE = /^\s*=> /;

function parseExpectationFromNode(node) {
  let val = [
    node.trailingComments[0].value.replace(ASSERTION_RE, ''),
    node.trailingComments.slice(1).map(commment => comment.value)
  ].join('')
  return types.stringLiteral(val);
}

function isAssertionNode(node) {
  return (
    types.isExpressionStatement(node) &&
    node.trailingComments &&
    node.trailingComments.length > 0 &&
    ASSERTION_RE.exec(node.trailingComments[0].value)
  );
}

function renderText(node) {
  if (node.value) {
    return node.value;
  } else if (node.children) {
    return node.children.map(renderText).join('');
  } else {
    return null;
  }
}
