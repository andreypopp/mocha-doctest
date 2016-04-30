/**
 * @copyright 2016-present, Andrey Popp <8mayday@gmail.com>
 * @flow
 */

import generate from 'babel-generator';
import * as BabelCore from 'babel-core';
import * as types from 'babel-types';
import * as Remark from 'remark';
import traverse from 'babel-traverse';
import * as Babylon from 'babylon';
import visitNode from 'unist-util-visit';

type JSASTComment = {
  value: string;
};
type JSAST = {
  trailingComments: ?Array<JSASTComment>;
};

type MDAST = any;

type Options = $Shape<{
  name: string
}>;

const REPR_ASSERTION_RE = /^\s*=> /;
const ERR_ASSSERTION_RE = /^\s([a-zA-Z]*Error): /;

const TESTDOC_SEEN = '__TESTDOC_SEEN';
const RUNTIME = require.resolve('./runtime');

const SUPPORTED_LANG = {
  'js+test': true,
  'javasctipt+test': true,
};

export function compile(source: string, options: Options = {}) {

  // Find all code blocks in markdown
  let node = Remark.parse(source);
  let testCaseList = [];
  visitNode(node, 'code', (node, index, parent) => {
    let prev = parent.children[index - 1];
    let title = null;
    if (prev && prev.type === 'paragraph') {
      title = renderText(prev);
    }
    if (title && title[title.length - 1] === ':') {
      title = title.slice(0, title.length - 1);
    }
    if (SUPPORTED_LANG[node.lang]) {
      testCaseList.push({
        title: title,
        lang: node.lang,
        value: node.value
      });
    }
  });

  // Find all assertions within code blocks and generate case and import nodes
  // from them.
  let importList = [];
  let caseList = [];
  testCaseList.forEach(testCase => {
    let node = Babylon.parse(testCase.value, {allowImportExportEverywhere: true});
    let assertions = [];
    traverse(node, {

      enter(path) {
        let assertion = findAssertion(path.node);
        if (!path.node[TESTDOC_SEEN] && assertion) {
          let nodes;
          if (assertion === 'repr') {
            let {repr} = parseExpectationFromNode(path.node, assertion);
            nodes = stmt`
              __testdocRuntime.assertRepr(
                ${path.node.expression},
                "${repr}"
              );
            `;
          } else if (assertion === 'error') {
            let {name, message} = parseExpectationFromNode(path.node, assertion);
            nodes = stmt`
              __testdocRuntime.assertError(
                () => ${path.node.expression},
                "${name}", "${message}"
              );
            `;
          }
          nodes[TESTDOC_SEEN] = true;
          path.replaceWithMultiple(nodes);
        } else if (types.isImportDeclaration(path.node)) {
          importList.push(path.node);
          path.remove();
        }
      }

    });

    caseList = caseList.concat(stmt`
      it(
        "${types.stringLiteral(testCase.title || 'works')}",
        ${caseExpression(node.program.body)}
      );
    `);
  });

  // generate program
  let program = [];
  program = program.concat(
    stmt`
      import * as __testdocRuntime from '${types.stringLiteral(RUNTIME)}';
      import assert from 'assert';
    `,
    importList,
    stmt`
      describe(
        "${types.stringLiteral(options.name || 'Suite')}",
        ${caseExpression(caseList)}
      );
    `
  );

  // apply babel transformations
  // TODO: how to make it pickup .babelrc?
  program = types.program(program);
  program = BabelCore.transformFromAst(program, undefined, {presets: ['es2015']}).ast;

  return generate(program).code;
}

function caseExpression(body) {
  return types.functionExpression(null, [], types.blockStatement(body));
}

function parseExpectationFromNode(node, assertion) {
  let firstLine = node.trailingComments[0].value;
  let restLines = node.trailingComments.slice(1).map(comment => comment.value);
  if (assertion === 'repr') {
    firstLine = firstLine.replace(REPR_ASSERTION_RE, '');
    let repr = [firstLine].concat(restLines).join('');
    return {
      repr: types.stringLiteral(repr)
    };
  } else if (assertion === 'error') {
    let name = ERR_ASSSERTION_RE.exec(firstLine)[1];
    let message = firstLine.replace(ERR_ASSSERTION_RE, '');
    message = [message].concat(restLines).join('');
    return {
      name: types.stringLiteral(name),
      message: types.stringLiteral(message),
    };
  }
}

function findAssertion(node: JSAST): false | 'repr' | 'error' {
  if (
    types.isExpressionStatement(node) &&
    node.trailingComments &&
    node.trailingComments.length > 0
  ) {
    let firstLine = node.trailingComments[0].value;
    if (REPR_ASSERTION_RE.exec(firstLine)) {
      return 'repr';
    } else if (ERR_ASSSERTION_RE.exec(firstLine)) {
      return 'error';
    }
  } else {
    return false;
  }
}

function renderText(node: MDAST): ?string {
  if (node.value) {
    return node.value;
  } else if (node.children) {
    return node.children.map(renderText).join('');
  } else {
    return null;
  }
}
